import { Form, Link } from '@remix-run/react';
import { V2_MetaFunction, ActionFunction } from '@remix-run/node';
import { db } from '~/utils/db.server';
import { createUserSession } from '~/utils/sessions.server';
export const meta: V2_MetaFunction = () => {
  return [
    {
      title: 'Register',
    },
    {
      description: 'Register for an account',
    },
  ];
};

export const action: ActionFunction = async ({ request }) => {
  const formData = Object.fromEntries(await request.formData());
  const { name, email, password } = formData;
  console.log(name, email, password);
  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string'
  ) {
    throw new Response('Bad Request', { status: 400 });
  }
  const user = await db.user.create({
    data: {
      name,
      email,
      password,
    },
  });

  return createUserSession(user.id, '/');
};

export default function Register() {
  return (
    <main className='flex h-screen flex-col items-center justify-center gap-4 bg-purple-200 font-mono'>
      <section className=' w-full max-w-3xl rounded-xl bg-white p-4'>
        <div className='flex flex-col items-center justify-center gap-4 p-4'>
          <h1 className='text-4xl font-bold text-purple-500'>Register</h1>
          <Form
            method='POST'
            className='flex flex-col items-center justify-center gap-4'
          >
            <input
              className='w-full max-w-2xl rounded-lg border-2 border-purple-500 p-4'
              type='text'
              placeholder='Name'
              name='name'
            />
            <input
              className='w-full max-w-2xl rounded-lg border-2 border-purple-500 p-4'
              type='email'
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
            Already have an account?{' '}
            <Link to='../login' className='text-purple-500 hover:underline'>
              Sign in
            </Link>
          </h3>
        </div>
      </section>
    </main>
  );
}
