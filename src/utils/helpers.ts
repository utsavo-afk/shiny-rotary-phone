// helper functions

import { GraphQLError } from 'graphql';
import { JwtPayload, verify } from 'jsonwebtoken';
import prisma from './db';

// create our custom context
export async function createContext({ req, res }) {
  const currentUser = await attachAuthUser(req);

  return { task: prisma, currentUser };
}

// add this to any resolver to ensure use is authed
export function isAuthenticated(ctx) {
  if (!ctx.currentUser)
    throw new GraphQLError('Failed to access protected resource', {
      extensions: {
        code: 'USER_NOT_AUTH',
      },
    });
  return ctx.currentUser;
}

// attach authenticated user to context
export async function attachAuthUser(req) {
  const auth = req ? req.headers.authorization : null;
  if (!auth) return null;
  const validToken = auth.toLowerCase().includes('bearer ')
    ? auth.split(' ')[1]
    : null;
  if (!validToken) return null;
  const { id } = verify(validToken, 'secret_key') as unknown as JwtPayload;

  const authUser = id ? await prisma.user.findUnique({ where: { id } }) : null;
  return authUser;
}
