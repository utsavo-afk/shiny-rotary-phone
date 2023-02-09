import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { PrismaClient } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { JwtPayload, sign, verify } from 'jsonwebtoken';

const prisma = new PrismaClient();

const typeDefs = `#graphql
    type User {
        username: String!
        email: String!
        password: String!
        id: ID!
    }

    type AuthPayload {
      token: String
      user: User
    }

    type Query {
        userCount: Int!
        allUsers: [User!]!
        findUser(email: String!): User
        protected: User
    }

    type Mutation {
      register(email: String!, username: String!, password: String!): User
      login(email: String!, password: String!): AuthPayload
    }
`;

const resolvers = {
  Query: {
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
  },
  Mutation: {
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
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: ({ ...args }) => createContext({ ...args }),
}).then(({ url }) => console.log(`Server running at ${url}`));

// helper functions
// create our custom context
async function createContext({ req, res }) {
  const currentUser = await attachAuthUser(req);

  return { task: prisma, currentUser };
}

// add this to any resolver to ensure use is authed
function isAuthenticated(ctx) {
  if (!ctx.currentUser)
    throw new GraphQLError('Failed to access protected resource', {
      extensions: {
        code: 'USER_NOT_AUTH',
      },
    });
  return ctx.currentUser;
}

// attach authenticated user to context
async function attachAuthUser(req) {
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
