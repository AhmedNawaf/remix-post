import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
} from '@remix-run/react';
import {
  LoaderArgs,
  json,
  V2_MetaFunction,
  redirect,
  ActionFunction,
} from '@remix-run/node';
import { db } from '~/utils/db.server';
import { getUserSession } from '~/utils/sessions.server';
import { useEffect, useState } from 'react';
import { getPostById } from '~/utils/post/post.server';
import { getUser } from '~/utils/user/user.server';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.post?.title },
    { name: 'description', content: data?.post?.description },
  ];
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await getUserSession(request);
  const post = await getPostById(params.id);
  const user = await getUser(userId);

  const editAllowed = user?.id === userId;
  const isLogged = !!userId;

  return json({
    post,
    user,
    editAllowed,
    isLogged,
  });
};

export const action: ActionFunction = async ({ params, request }) => {
  const formData = Object.fromEntries(await request.formData());
  const { title, description } = formData;
  if (request.method === 'DELETE') {
    await db.todo.delete({
      where: {
        id: params.id,
      },
    });
    return redirect('/todos');
  }
  if (request.method === 'POST') {
    if (typeof title !== 'string' || typeof description !== 'string') {
      throw new Response('Bad Request', { status: 400 });
    }

    if (title.length < 3 || description.length < 3) {
      return 'The title and description must be at least 3 characters long';
    }

    const todo = await db.todo.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        description,
      },
    });

    if (!todo) {
      throw new Response("Couldn't Save the Todo", { status: 400 });
    }
    return redirect('.');
  }
};

export default function Todo() {
  const { user, post, editAllowed, isLogged } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);

  const errorMessage = actionData ? actionData.toString() : null;
  const { formMethod, state } = useNavigation();
  const isSubmitting = state === 'submitting' && formMethod === 'POST';
  const notVisible = !isLogged || !editAllowed;
  useEffect(() => {
    setTitle(post.title);
    setDescription(post.description);
  }, [post]);

  return (
    <div className='container flex flex-col gap-6 px-4 md:flex-1'>
      <div>
        <h2 className='text-4xl font-bold'>Todo</h2>
      </div>
      <h2 className='text-4xl'>User: {user?.name}</h2>
      <Form method='POST'>
        <fieldset disabled={isSubmitting}>
          <div className='flex flex-col gap-4'>
            {errorMessage && <div className='text-red-500'>{errorMessage}</div>}
            <label htmlFor='title'>Title</label>
            <input
              className='rounded-lg border border-gray-300 p-4'
              type='text'
              name='title'
              id='title'
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              readOnly={!editAllowed}
            />
          </div>
          <div className='flex flex-col gap-4'>
            <label htmlFor='description'>Description</label>
            <textarea
              className='rounded-lg border border-gray-300 p-4'
              name='description'
              id='description'
              onChange={(e) => setDescription(e.target.value)}
              value={description}
              readOnly={!editAllowed}
            ></textarea>
          </div>
        </fieldset>
        {!notVisible && (
          <button className='mt-4 rounded-lg bg-white p-4 text-xl transition-all hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:bg-opacity-50'>
            {isSubmitting ? 'Saving...' : 'Save Todo'}
          </button>
        )}
      </Form>
      {!notVisible && (
        <Form method='DELETE'>
          <button className='rounded-lg bg-white p-4 text-xl transition-all hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:bg-opacity-50'>
            Delete Todo
          </button>
        </Form>
      )}
    </div>
  );
}
