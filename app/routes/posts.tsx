import { V2_MetaFunction, defer } from '@remix-run/node';
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  Await,
} from '@remix-run/react';
import { getPosts } from '~/utils/post/post.server';
import { Suspense } from 'react';
export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Posts' },
    { name: 'description', content: 'This is The Posts page' },
  ];
};

export const loader = async () => {
  const postsPromise = getPosts();
  return defer({
    postsPromise,
  });
};

export default function Todos() {
  const { pathname } = useLocation();
  const { postsPromise } = useLoaderData<typeof loader>();
  return (
    <main className='act flex h-screen items-center justify-center gap-4 bg-purple-200 font-mono'>
      <section className='container mx-auto flex flex-col gap-8 px-4 text-center md:flex-row md:gap-0'>
        <div className='container flex flex-col gap-6 self-center px-4 md:flex-1'>
          <div>
            <h2 className='text-4xl font-bold'>Posts</h2>
            <ul className='mt-4 flex flex-col items-center gap-4 '>
              <Suspense fallback={<div>Loading ...</div>}>
                <Await resolve={postsPromise}>
                  {(posts) =>
                    posts.map((post) => (
                      <li
                        key={post.id}
                        className='flex w-1/3  items-center justify-center rounded bg-white p-4'
                      >
                        <Link className='text-lg hover:underline' to={post.id}>
                          {post.title}
                        </Link>
                      </li>
                    ))
                  }
                </Await>
              </Suspense>
            </ul>
          </div>
          {!pathname.includes('new') && (
            <Link
              to='new'
              className='mt-4 self-center rounded-lg bg-white p-4 text-xl transition-all hover:underline'
            >
              Add Post
            </Link>
          )}
        </div>
        <div className='container px-4 md:flex-1'>
          <Outlet />
        </div>
      </section>
    </main>
  );
}
