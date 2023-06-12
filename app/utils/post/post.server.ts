import { db } from '../db.server';
import { json } from '@remix-run/node';

export async function createPost(
  title: string,
  description: string,
  userId: string | undefined
) {
  const post = await db.post.create({
    data: {
      title,
      description,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });

  if (!post) {
    throw json({ message: 'Post not created' }, { status: 500 });
  }

  return post;
}

export async function getPosts() {
  const posts = await db.post.findMany({
    take: 5,
  });
  if (!posts) {
    return [];
  }
  return posts;
}

export async function getPostById(id: string | undefined) {
  const post = await db.post.findUnique({
    where: {
      id,
    },
  });
  if (!post) {
    throw json({ message: 'Post not found' }, { status: 404 });
  }
  return post;
}
