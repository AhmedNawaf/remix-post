import { db } from '../db.server';
import { json } from '@remix-run/node';
import bcrypt from 'bcrypt';

export async function createUser(
  name: string,
  email: string,
  password: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  if (!user) {
    throw json({ message: 'User not created' }, { status: 500 });
  }

  return user;
}

export async function getUser(id: string | undefined) {
  const user = await db.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw json({ message: 'User not found' }, { status: 404 });
  }

  return user;
}

async function getUserByEmail(email: string) {
  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw json({ message: 'User not found' }, { status: 404 });
  }

  return user;
}

export async function validateLogin(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return null;
  }

  return user.id;
}
