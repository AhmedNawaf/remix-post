import type { V2_MetaFunction } from '@remix-run/node';
import {
  Link,
  Outlet,
  useLoaderData,
  useLocation,
  useNavigation,
} from '@remix-run/react';
import { db } from '~/utils/db.server';

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Todos' },
    { name: 'description', content: 'This is a The Todos page' },
  ];
};

export const loader = async () => {
  const todos = db.todo.findMany({
    take: 5,
  });
  if (!todos) return [];
  return todos;
};

export default function Todos() {
  const { pathname } = useLocation();
  const todos = useLoaderData<typeof loader>();
  return (
    <main className='flex h-screen items-center justify-center gap-4 bg-purple-200 font-mono'>
      <section className='container mx-auto flex flex-col gap-8 px-4 text-center md:flex-row md:gap-0'>
        <div className='container flex flex-col gap-6 px-4 md:flex-1'>
          <div>
            <h2 className='text-4xl font-bold'>Todos</h2>
            <ul className='mt-4 flex flex-col items-center gap-4 '>
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className='flex w-1/3  items-center justify-center rounded bg-white p-4'
                >
                  <Link className='text-lg hover:underline' to={todo.id}>
                    {todo.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          {!pathname.includes('new') && (
            <div>
              <Link
                to='new'
                className='rounded-lg bg-white p-4 text-xl transition-all hover:underline'
              >
                Add Todo
              </Link>
            </div>
          )}
        </div>
        <div className='container px-4 md:flex-1'>
          <Outlet />
        </div>
      </section>
    </main>
  );
}
