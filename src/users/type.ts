export const userTypeDefs = `#graphql
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
