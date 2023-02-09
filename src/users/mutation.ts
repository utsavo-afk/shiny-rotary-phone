import { GraphQLError } from 'graphql';
import { sign } from 'jsonwebtoken';

export const userMutation = {
  register: async (_, { username, email, password }, context) => {
    return await context.task.user.create({
      data: {
        username,
        email,
        password,
      },
    });
  },
  login: async (_, { email, password }, context) => {
    const user = await context.task.user.findUnique({ where: { email } });

    if (!user) throw new GraphQLError('USER_NOT_FOUND');
    // we can compare hash password

    const token = sign({ id: user.id }, 'secret_key');
    return { user, token };
  },
};
