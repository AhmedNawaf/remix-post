import { getSession, commitSession, destroySession } from '~/sessions';
import { redirect } from '@remix-run/node';

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await getSession();
  session.set('userId', userId);
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session),
    },
  });
}

export async function getUserSession(request: Request) {
  const session = await getSession(request.headers.get('Cookie'));
  return session.get('userId');
}

export async function destroyUserSession(request: Request, redirectTo: string) {
  const session = await getSession(request.headers.get('Cookie'));

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}
