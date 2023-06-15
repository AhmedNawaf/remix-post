import {
  useLoaderData,
  useActionData,
  Form,
  useNavigation,
  isRouteErrorResponse,
  useRouteError,
  Outlet,
  Link,
  useLocation,
} from '@remix-run/react';
import {
  LoaderArgs,
  json,
  V2_MetaFunction,
  redirect,
  ActionArgs,
} from '@remix-run/node';
import { getUserSession } from '~/utils/sessions.server';
import { useEffect, useState } from 'react';
import {
  deletePostAndComments,
  getPostById,
  updatePost,
} from '~/utils/post/post.server';
import { getUser } from '~/utils/user/user.server';
import { badRequest } from '~/utils/request.server';
import {
  FormErrorSchema,
  type TFormError,
  PostFormSchema,
} from '~/utils/post/post.schema';
import { parseForm } from 'zodix';
import { ZodError } from 'zod';

export const meta: V2_MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: data?.post?.title },
    { name: 'description', content: data?.post?.description },
  ];
};

export const loader = async ({ params, request }: LoaderArgs) => {
  const userId = await getUserSession(request);
  const post = await getPostById(params.id);

  const editAllowed = post.user.id === userId;
  const isLogged = Boolean(userId);

  return json({
    post,
    editAllowed,
    isLogged,
  });
};

export const action = async ({ params, request }: ActionArgs) => {
  if (request.method === 'DELETE') {
    await deletePostAndComments(params.id);
    return redirect('/posts');
  }
  if (request.method === 'POST') {
    try {
      const { title, description } = await parseForm(request, PostFormSchema);
      await updatePost(params.id, title, description);
      return redirect('.');
    } catch (error) {
      if (error instanceof ZodError) {
        const fieldErrors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        const errorData = {
          title: fieldErrors.find((error) => error.field === 'title')?.message,
          description: fieldErrors.find(
            (error) => error.field === 'description'
          )?.message,
        };
        return badRequest<TFormError>(errorData);
      }
    }
  }
};

export default function Todo() {
  const { post, editAllowed, isLogged } = useLoaderData<typeof loader>();
  const actionData = FormErrorSchema.parse(useActionData());
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const { formMethod, state } = useNavigation();
  const isSubmitting = state === 'submitting' && formMethod === 'POST';
  const notVisible = !isLogged || !editAllowed;
  const { pathname } = useLocation();

  useEffect(() => {
    setTitle(post.title);
    setDescription(post.description);
  }, [post]);

  return (
    <div className='container flex flex-col gap-4 px-4 md:flex-1'>
      <div>
        <h2 className='text-4xl font-bold'>Post</h2>
      </div>
      <h2 className='text-4xl'>User: {post.user.name}</h2>
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
              aria-invalid={Boolean(actionData?.title)}
            />
            {actionData?.title && (
              <div id='title-error' className='text-red-600' role='alert'>
                {actionData.title}
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
              aria-invalid={Boolean(actionData?.description)}
            ></textarea>
            {actionData?.description && (
              <div id='description-error' className='text-red-600' role='alert'>
                {actionData.description}
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
      <Link
        to={pathname.includes('comments') ? './' : 'comments'}
        className='mt-4 self-start text-xl'
        prefetch='intent'
      >
        {pathname.includes('comments') ? 'Hide' : 'Show'} comments
      </Link>
      <Outlet />
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
