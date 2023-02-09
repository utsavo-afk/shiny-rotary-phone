import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { userMutation } from './users/mutation';
import { userQuery } from './users/query';
import { userTypeDefs } from './users/type';
import { createContext } from './utils/helpers';

const resolvers = {
  Query: {
    ...userQuery,
  },
  Mutation: {
    ...userMutation,
  },
};

const server = new ApolloServer({
  typeDefs: [userTypeDefs],
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: ({ ...args }) => createContext({ ...args }),
}).then(({ url }) => console.log(`Server running at ${url}`));
