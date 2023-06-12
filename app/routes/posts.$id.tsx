import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
  isRouteErrorResponse,
  useRouteError,
} from '@remix-run/react';
import {
  LoaderArgs,
  json,
  V2_MetaFunction,
  redirect,
  ActionArgs,
} from '@remix-run/node';
import { db } from '~/utils/db.server';
import { getUserSession } from '~/utils/sessions.server';
import { useEffect, useState } from 'react';
import { getPostById, updatePost } from '~/utils/post/post.server';
import { getUser } from '~/utils/user/user.server';
import { badRequest } from '~/utils/request.server';
import {
  validateTitle,
  validateDescription,
} from '~/utils/post/postValidation';

interface ErrorFormat {
  fieldErrors:
    | {
        title: string | undefined;
        description: string | undefined;
      }
    | undefined;
  fields:
    | {
        title: string;
        description: string;
      }
    | undefined;
  formError: string | null;
}

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.post?.title },
    { name: 'description', content: data?.post?.description },
  ];
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await getUserSession(request);
  const post = await getPostById(params.id);
  const user = await getUser(post.userId);

  const editAllowed = user?.id === userId;
  const isLogged = !!userId;

  return json({
    post,
    user,
    editAllowed,
    isLogged,
  });
};

export const action = async ({ params, request }: ActionArgs) => {
  if (request.method === 'DELETE') {
    await db.post.delete({
      where: {
        id: params.id,
      },
    });
    return redirect('/posts');
  }
  if (request.method === 'POST') {
    const formData = Object.fromEntries(await request.formData());
    const { title, description } = formData;
    if (typeof title !== 'string' || typeof description !== 'string') {
      return badRequest({
        formError: 'Invalid form data',
      });
    }

    const fieldErrors = {
      title: validateTitle(title),
      description: validateDescription(description),
    };

    if (Object.values(fieldErrors).some(Boolean)) {
      return badRequest({
        fieldErrors,
        formError: null,
      });
    }

    await updatePost(params.id, title, description);
    return redirect(`/posts/${params.id}`);
  }
};

export default function Todo() {
  const { user, post, editAllowed, isLogged } = useLoaderData<typeof loader>();
  const actionData = useActionData<ErrorFormat>();
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
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
        <h2 className='text-4xl font-bold'>Post</h2>
      </div>
      <h2 className='text-4xl'>User: {user?.name}</h2>
      <Form method='POST'>
        <fieldset disabled={isSubmitting}>
          <div className='flex flex-col gap-4'>
            <label htmlFor='title'>Title</label>
            <input
              className='rounded-lg border border-gray-300 p-4'
              type='text'
              name='title'
              id='title'
              onChange={(e) => setTitle(e.target.value)}
              value={title}
              readOnly={!editAllowed}
              aria-invalid={Boolean(actionData?.fieldErrors?.title)}
              aria-errormessage={
                actionData?.fieldErrors?.title && 'title-error'
              }
            />
            {actionData?.fieldErrors?.title && (
              <div id='title-error' className='text-red-600' role='alert'>
                {actionData.fieldErrors.title}
              </div>
            )}
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
              aria-invalid={Boolean(actionData?.fieldErrors?.description)}
              aria-errormessage={
                actionData?.fieldErrors?.description && 'description-error'
              }
            ></textarea>
            {actionData?.fieldErrors?.description && (
              <div id='description-error' className='text-red-600' role='alert'>
                {actionData.fieldErrors.description}
              </div>
            )}
          </div>
        </fieldset>
        {!notVisible && (
          <div className='mx-auto mt-6 flex w-1/4 flex-col items-center gap-4'>
            <button className='w-full rounded-lg bg-white p-4 text-xl transition-all hover:bg-blue-600 hover:text-white disabled:cursor-not-allowed disabled:bg-opacity-50'>
              {isSubmitting ? 'Saving...' : 'Save Todo'}
            </button>
          </div>
        )}
      </Form>
      {!notVisible && (
        <Form method='DELETE'>
          <button className=' rounded-lg bg-white p-4 text-xl transition-all hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:bg-opacity-50'>
            Delete Todo
          </button>
        </Form>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return <div className='text-3xl text-red-500'>{error.statusText}</div>;
  }

  if (error instanceof Error) {
    return <div className='text-3xl text-red-500'>{error.message}</div>;
  }

  return <div className='text-red-500'>Something went wrong</div>;
}
