import { isAuthenticated } from './../utils/helpers';

export const userQuery = {
  userCount: async (_, __, context) => {
    return await context.task.user.count();
  },
  allUsers: async (_, __, context) => {
    return await context.task.user.findMany({});
  },
  findUser: async (_, { email }, context) => {
    return await context.task.user.findUnique({ where: { email } });
  },
  protected: (_, __, context) => {
    return isAuthenticated(context);
  },
};
