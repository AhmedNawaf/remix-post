import { useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';
import { LoaderArgs } from '@remix-run/node';

export async function loader({ params }: LoaderArgs) {
  const post = await db.post.findUnique({
    where: { id: params.id },
    include: { comments: true },
  });
  return { comments: post?.comments ?? [] };
}

export default function PostComments() {
  const { comments } = useLoaderData<typeof loader>();
  return (
    <>
      <h1 className='text-3xl'>Comment</h1>
      <ul>
        {comments.map((comment) => (
          <li key={comment.id}>{comment.text}</li>
        ))}
      </ul>
    </>
  );
}
