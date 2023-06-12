import {
  Form,
  useActionData,
  useNavigation,
  isRouteErrorResponse,
  useRouteError,
} from '@remix-run/react';
import { ActionArgs, redirect, LoaderFunction, json } from '@remix-run/node';
import { getUserSession } from '~/utils/sessions.server';
import { badRequest } from '~/utils/request.server';
import {
  validateTitle,
  validateDescription,
} from '~/utils/post/postValidation';
import { createPost } from '~/utils/post/post.server';

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserSession(request);

  if (!userId) {
    return redirect('/login');
  }

  return null;
};

export const action = async ({ request }: ActionArgs) => {
  const userId = await getUserSession(request);
  const formData = Object.fromEntries(await request.formData());
  const { title, description } = formData;
  if (typeof title !== 'string' || typeof description !== 'string') {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: 'Form not submitted correctly',
    });
  }

  const fieldErrors = {
    title: validateTitle(title),
    description: validateDescription(description),
  };
  const fields = { title, description };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields, formError: null });
  }
  const post = await createPost(title, description, userId);

  return redirect(`/posts/${post.id}`);
};
export default function TodoForm() {
  const actionData = useActionData<typeof action>();
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
            defaultValue={actionData?.fields?.title}
            aria-invalid={Boolean(actionData?.fieldErrors?.title)}
            aria-errormessage={actionData?.fieldErrors?.title && 'title-error'}
          />
          {actionData?.fieldErrors?.title && (
            <p id='title-error' className='text-red-500' role='alert'>
              {actionData?.fieldErrors?.title}
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
            defaultValue={actionData?.fields?.description}
            aria-invalid={Boolean(actionData?.fieldErrors?.description)}
            aria-errormessage={
              actionData?.fieldErrors?.description && 'description-error'
            }
          ></textarea>
          {actionData?.fieldErrors?.description && (
            <p id='description-error' className='text-red-500' role='alert'>
              {actionData?.fieldErrors?.description}
            </p>
          )}
        </div>
        {actionData?.formError && (
          <p className='text-red-500' role='alert'>
            {actionData?.formError}
          </p>
        )}
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
