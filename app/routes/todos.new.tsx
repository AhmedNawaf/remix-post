import { Form, useActionData } from '@remix-run/react';
import { ActionArgs, redirect, LoaderFunction } from '@remix-run/node';
import { db } from '~/utils/db.server';
import FormFields from '~/components/FormFields';
import { getUserSession } from '~/utils/sessions.server';

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getUserSession(request);
  console.log(session);

  if (!session) {
    return redirect('/login');
  }
  return {
    session,
  };
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await getUserSession(request);
  const formData = Object.fromEntries(await request.formData());
  const { title, description } = formData;
  if (typeof title !== 'string' || typeof description !== 'string') {
    throw new Response('Bad Request', { status: 400 });
  }

  if (title.length < 3 || description.length < 3) {
    return 'The title and description must be at least 3 characters long';
  }

  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  const todo = await db.todo.create({
    data: {
      title,
      description,
      user: {
        connect: {
          id: user?.id,
        },
      },
    },
  });

  if (!todo) {
    throw new Response("Couldn't Save the Todo", { status: 400 });
  }

  return redirect(`/todos/${todo.id}`);
};
export default function TodoForm() {
  const actionData = useActionData<typeof action>();
  const errorMessage = actionData ? actionData.toString() : null;
  return (
    <Form method='POST' className='space-y-5 text-xl'>
      <FormFields errorMessage={errorMessage} />
      <button className='mt-4 rounded-lg bg-white p-4 text-xl transition-all hover:bg-purple-300'>
        Add Todo
      </button>
    </Form>
  );
}
