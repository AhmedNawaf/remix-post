import {
  type V2_MetaFunction,
  LoaderArgs,
  ActionArgs,
  json,
} from '@remix-run/node';
import { Form, Link, useLoaderData } from '@remix-run/react';
import { getUserSession, destroyUserSession } from '~/utils/sessions.server';

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Remix Todo App' },
    { name: 'description', content: 'This is a simple Todo App' },
  ];
};

export const loader = async ({ request }: LoaderArgs) => {
  const user = await getUserSession(request);
  return json({
    loggedIn: !!user,
  });
};

export const action = async ({ request }: ActionArgs) => {
  return destroyUserSession(request, '/');
};

export default function Index() {
  const { loggedIn } = useLoaderData<typeof loader>();
  return (
    <main className='flex h-screen flex-col items-center justify-center gap-4 bg-purple-200 font-mono'>
      <h1 className='text-4xl font-bold'>Welcome to Our Todo App!</h1>
      <Link to='posts' className='text-2xl hover:underline'>
        Make Todos
      </Link>
      {loggedIn ? (
        <Form method='POST'>
          <button className='text-2xl hover:underline'>Logout</button>
        </Form>
      ) : (
        <Link to='login' className='text-2xl hover:underline'>
          Login
        </Link>
      )}
    </main>
  );
}
