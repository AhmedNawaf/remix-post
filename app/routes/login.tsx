import { Form, Link } from '@remix-run/react';
import { V2_MetaFunction, ActionFunction } from '@remix-run/node';
import { db } from '~/utils/db.server';
import { createUserSession } from '~/utils/sessions.server';

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: 'Login',
    },
    {
      description: 'Login to your account',
    },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = Object.fromEntries(await request.formData());
  const { email, password } = formData;
  if (typeof email !== 'string' || typeof password !== 'string') {
    throw new Response('Bad Request', { status: 400 });
  }

  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return 'Invalid Email or Password';
  }

  const passwordValid = password === user.password;

  if (!passwordValid) {
    return 'Invalid Email or Password';
  }

  return createUserSession(user.id, '/');
};

export default function Login() {
  return (
    <main className='flex h-screen flex-col items-center justify-center gap-4 bg-purple-200 font-mono'>
      <section className=' w-full max-w-3xl rounded-xl bg-white p-4'>
        <div className='flex flex-col items-center justify-center gap-4 p-4'>
          <h1 className='text-4xl font-bold text-purple-500'>Login</h1>
          <Form
            method='POST'
            className='flex flex-col items-center justify-center gap-4'
          >
            <input
              className='w-full max-w-2xl rounded-lg border-2 border-purple-500 p-4'
              type='text'
              placeholder='Email'
              name='email'
            />
            <input
              className='w-full max-w-2xl rounded-lg border-2 border-purple-500 p-4'
              type='password'
              placeholder='Password'
              name='password'
            />
            <button
              className='w-full max-w-2xl rounded-lg border-2 border-purple-500 bg-purple-500 p-4 font-bold text-white'
              type='submit'
            >
              Login
            </button>
          </Form>
          <h3>
            Don't have an account?{' '}
            <Link to='../register' className='text-purple-500 hover:underline'>
              Sign up
            </Link>
          </h3>
        </div>
      </section>
    </main>
  );
}
