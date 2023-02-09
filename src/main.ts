import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { userMutation } from './users/mutation';
import { userQuery } from './users/query';
import { createContext } from './utils/helpers';

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
    ...userQuery,
  },
  Mutation: {
    ...userMutation,
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
