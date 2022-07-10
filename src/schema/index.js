const { createApplication, createModule } = require('graphql-modules');
const { gql } = require('graphql-modules');
const { Authentication, AuthenticationResolver} = require('./Authentication/Authentication.type');
const { House, HouseResolver } = require('./House/House.type');
const { Task, TaskResolver } = require('./Task/Task.type');

const MutationStatus = gql`
    type MutationStatus {
        status: Int
    }
`

const Query = gql`
    type Query {
        authentication(email: String!, password: String): Authentication
        getUser: MyUser
        getMyHouse: HouseResponse
        getHouse(houseUUID: String!): HouseResponse
        getTasks: Tasks
    },
    type Mutation {
        register(nickname: String!, email: String!, password: String!): MutationStatus
        createHouse(name: String!): MutationStatus
        joinHouse(houseUUID: String!): MutationStatus
        updateHouseStatus(userUUID: String!, status: String!): MutationStatus
        createTask(name: String!, color: String!): MutationStatus
        completeTask(taskUUID: String!): MutationStatus
    }
`;

const rootModule = createModule({
    id: 'root-module',
    typeDefs: [Query, MutationStatus, Authentication, House, Task],
    resolvers: [AuthenticationResolver, HouseResolver, TaskResolver]
})

const application = createApplication({
    modules: [rootModule],
});

module.exports = {
    application
}