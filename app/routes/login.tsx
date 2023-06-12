import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { V2_MetaFunction, ActionArgs } from '@remix-run/node';
import { createUserSession } from '~/utils/sessions.server';
import { validateLogin } from '~/utils/user/user.server';
import { badRequest } from '~/utils/request.server';
import { validateEmail, validatePassword } from '~/utils/user/user.validation';

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
  const formData = Object.fromEntries(await request.formData());
  const { email, password } = formData;
  if (typeof email !== 'string' || typeof password !== 'string') {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: "The form didn't submit correctly",
    });
  }

  const fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  const fields = {
    email,
    password,
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({
      fieldErrors,
      fields,
      formError: 'The form did not validate correctly',
    });
  }

  const userId = await validateLogin(email, password);
  if (!userId) {
    return badRequest({
      fieldErrors: null,
      fields: null,
      formError: 'Invalid email or password',
    });
  }

  return createUserSession(userId, '/');
};

export default function Login() {
  const actionData = useActionData<typeof action>();
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
                  className='rounded-lg border-2 border-purple-500 p-4 disabled:bg-opacity-50'
                  type='email'
                  id='email'
                  name='email'
                  defaultValue={actionData?.fields?.email}
                  aria-invalid={Boolean(actionData?.fieldErrors?.email)}
                  aria-errormessage={actionData?.fieldErrors?.email}
                />
                {actionData?.fieldErrors?.email && (
                  <p className='text-center text-red-500'>
                    {actionData.fieldErrors.email}
                  </p>
                )}
              </div>
              <div className='flex w-full flex-col '>
                <label htmlFor='password'>
                  Password<sup className='text-red-500'>*</sup>
                </label>
                <input
                  className='rounded-lg border-2 border-purple-500 p-4 disabled:bg-opacity-50'
                  type='password'
                  id='password'
                  name='password'
                  defaultValue={actionData?.fields?.password}
                  aria-invalid={Boolean(actionData?.fieldErrors?.password)}
                  aria-errormessage={actionData?.fieldErrors?.password}
                />
                {actionData?.fieldErrors?.password && (
                  <p className='text-center text-red-500'>
                    {actionData.fieldErrors.password}
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
            <Link to='../register' className='text-purple-500 hover:underline'>
              Sign up
            </Link>
          </h3>
        </div>
      </section>
    </main>
  );
}
