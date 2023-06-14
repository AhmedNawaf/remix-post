import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { V2_MetaFunction, ActionArgs } from '@remix-run/node';
import { createUserSession } from '~/utils/sessions.server';
import { validateLogin } from '~/utils/user/user.server';
import { badRequest } from '~/utils/request.server';
import { parseForm } from 'zodix';
import { ZodError } from 'zod';
import {
  LoginSchema,
  FromErrorsSchema,
  type TRegisterFromErrors,
} from '~/utils/user/user.schema';

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: 'Login',
    },
    {
      name: 'description',
      content: 'Login to your account',
    },
  ];
};

export const action = async ({ request }: ActionArgs) => {
  try {
    const { email, password } = await parseForm(request, LoginSchema);

    const userId = await validateLogin(email, password);
    console.log('Here we go 3');

    if (!userId) {
      return badRequest({
        formError: 'Invalid email or password',
      });
    }
    console.log('Here we go 4');
    const session = await createUserSession(userId, '/');
    console.log('Here we go');

    return session;
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      const errorData = {
        email: fieldErrors.find((error) => error.field === 'email')?.message,
        password: fieldErrors.find((error) => error.field === 'password')
          ?.message,
      };
      return badRequest<TRegisterFromErrors>(errorData);
    }
  }
};

export default function Login() {
  const actionData = FromErrorsSchema.parse(useActionData());
  const { state } = useNavigation();
  const isSubmitting = state === 'submitting';
  return (
    <main className='flex h-screen flex-col items-center justify-center gap-4 bg-purple-200 font-mono'>
      <section className=' w-full max-w-3xl rounded-xl bg-white p-4'>
        <div className='flex flex-col items-center justify-center gap-4 p-4'>
          <h1 className='text-4xl font-bold text-purple-500'>Login</h1>
          <Form method='POST' className='w-1/2'>
            <fieldset
              className='flex flex-col items-center justify-center gap-4'
              disabled={isSubmitting}
            >
              <div className='flex w-full flex-col'>
                <label className='block' htmlFor='email'>
                  Email<sup className='text-red-500'>*</sup>
                </label>
                <input
                  required
                  className='rounded-lg border-2 border-purple-500 p-4 disabled:bg-opacity-50'
                  type='email'
                  id='email'
                  name='email'
                  aria-invalid={Boolean(actionData?.email)}
                  aria-errormessage={actionData?.email || ''}
                  autoComplete='email'
                />
                {actionData?.email && (
                  <p className='mt-3 text-center text-red-500'>
                    {actionData.email}
                  </p>
                )}
              </div>
              <div className='flex w-full flex-col '>
                <label htmlFor='password'>
                  Password<sup className='text-red-500'>*</sup>
                </label>
                <input
                  required
                  className='rounded-lg border-2 border-purple-500 p-4 disabled:bg-opacity-50'
                  type='password'
                  id='password'
                  name='password'
                  defaultValue={actionData?.password || ''}
                  aria-invalid={Boolean(actionData?.password)}
                  aria-errormessage={actionData?.password || ''}
                />
                {actionData?.password && (
                  <p className='mt-3 text-center text-red-500'>
                    {actionData.password}
                  </p>
                )}
              </div>
              {actionData?.formError && (
                <p className='text-red-500'>{actionData.formError}</p>
              )}
              <button
                className='w-full max-w-2xl rounded-lg border-2 border-purple-500 bg-purple-500 p-4 font-bold text-white disabled:bg-opacity-50 '
                type='submit'
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </fieldset>
          </Form>
          <h3>
            Don't have an account?{' '}
            <Link
              to='../register'
              className='text-purple-500 hover:underline'
              prefetch='intent'
            >
              Sign up
            </Link>
          </h3>
        </div>
      </section>
    </main>
  );
}
