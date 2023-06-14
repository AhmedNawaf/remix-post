import { db } from '../db.server';
import { json } from '@remix-run/node';
import { ZodSchema, ZodError } from 'zod';
import { parseForm } from 'zodix';

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
  const posts = db.post.findMany({
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
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
  if (!post) {
    throw json({ message: 'Post not found' }, { status: 404 });
  }
  return post;
}

export async function updatePost(
  id: string | undefined,
  title: string,
  description: string
) {
  const post = await db.post.update({
    where: {
      id,
    },
    data: {
      title,
      description,
    },
  });
  if (!post) {
    throw json({ message: 'Post not updated' }, { status: 500 });
  }
  return post;
}

export async function deletePost(id: string | undefined) {
  const post = await db.post.delete({
    where: {
      id,
    },
  });
  if (!post) {
    throw json({ message: 'Post not deleted' }, { status: 500 });
  }
  return post;
}
