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
      console.log(context.currentUser);

      if (!context.currentUser)
        throw new GraphQLError('Failed ot access protected resource', {
          extensions: {
            code: 'USER_NOT_AUTH',
          },
        });
      return context.currentUser;
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
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;

    // if (!auth || !auth.toLowerCase().includes('bearer'))
    //   throw new GraphQLError('USER_NOT_AUTH');
    const token = auth && auth.split(' ')[1];

    const decoded = token && (verify(token, 'secret_key') as JwtPayload);
    let id = decoded && (decoded as unknown as JwtPayload).id;

    const currentUser = token
      ? await prisma.user.findUnique({
          where: { id },
        })
      : null;

    return { task: prisma, currentUser };
  },
}).then(({ url }) => console.log(`Server running at ${url}`));
