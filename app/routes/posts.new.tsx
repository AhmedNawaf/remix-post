import {
  Form,
  useActionData,
  useNavigation,
  isRouteErrorResponse,
  useRouteError,
} from '@remix-run/react';
import {
  ActionArgs,
  redirect,
  LoaderFunction,
  V2_MetaFunction,
} from '@remix-run/node';
import { getUserSession } from '~/utils/sessions.server';
import { badRequest } from '~/utils/request.server';
import { createPost } from '~/utils/post/post.server';
import { parseForm } from 'zodix';
import {
  PostFormSchema,
  TFormError,
  FormErrorSchema,
} from '~/utils/post/post.schema';
import { ZodError } from 'zod';

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Create Post' },
    { name: 'description', content: 'This is The Create Post page' },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserSession(request);

  if (!userId) {
    return redirect('/login');
  }

  return null;
};

export const action = async ({ request }: ActionArgs) => {
  try {
    const userId = await getUserSession(request);
    const { title, description } = await parseForm(request, PostFormSchema);
    await createPost(title, description, userId);
    return redirect('/posts');
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      const errorData = {
        title: fieldErrors.find((error) => error.field === 'title')?.message,
        description: fieldErrors.find((error) => error.field === 'description')
          ?.message,
      };
      return badRequest<TFormError>(errorData);
    }
  }
};
export default function TodoForm() {
  const actionData = FormErrorSchema.parse(useActionData());
  const { state } = useNavigation();
  return (
    <Form method='POST' className='space-y-5 text-xl'>
      <fieldset className='space-y-8' disabled={state === 'submitting'}>
        <legend className='text-3xl font-bold'>Create a new Post</legend>
        <div className='flex flex-col gap-4'>
          <label htmlFor='title'>Title</label>
          <input
            className='rounded-lg border border-gray-300 p-4'
            type='text'
            name='title'
            id='title'
            aria-invalid={Boolean(actionData?.title)}
            aria-errormessage={actionData?.title ?? 'title-error'}
          />
          {actionData?.title && (
            <p id='title-error' className='text-red-500' role='alert'>
              {actionData?.title}
            </p>
          )}
        </div>
        <div className='flex flex-col gap-4'>
          <label htmlFor='description'>Description</label>
          <textarea
            className='rounded-lg border border-gray-300 p-4'
            name='description'
            id='description'
            rows={4}
            aria-invalid={Boolean(actionData?.description)}
            aria-errormessage={actionData?.description ?? 'description-error'}
          ></textarea>
          {actionData?.description && (
            <p id='description-error' className='text-red-500' role='alert'>
              {actionData?.description}
            </p>
          )}
        </div>
        <button className='mt-4 rounded-lg bg-white p-4 text-xl transition-all hover:bg-purple-300'>
          {state === 'submitting' ? 'Creating...' : 'Create'}
        </button>
      </fieldset>
    </Form>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <div className='text-red-500'>{error.data}</div>;
  }

  if (error instanceof Error) {
    return <div className='text-red-500'>{error.message}</div>;
  }

  return <div className='text-red-500'>Something went wrong</div>;
}
