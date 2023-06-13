import { Outlet } from '@remix-run/react';
import { LoaderFunction, redirect } from '@remix-run/node';
import { getUserSession } from '~/utils/sessions.server';

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserSession(request);
  if (userId) {
    return redirect('/');
  }
  return null;
};

export default function Auth() {
  return <Outlet />;
}
