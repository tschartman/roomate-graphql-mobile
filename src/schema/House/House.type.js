const { gql } = require('graphql-modules');
const jwtAuth = require('../../middleware/jwtAuth');

const House = gql`
    type HouseResponse {
        status: Int
        house: House 
    }

    type House {
        name: String
        uuid: String
        Roommates: [Roommate]
        Tasks: [Task]
    }

    type Roommate {
        status: String
        User: User
    }
`

const HouseResolver = {
    Query: {
        async getMyHouse(root, args, {models, token}) {
            const authenticated = await jwtAuth(token);
            if (authenticated) {
                let houseUser = await models.HouseUser.findOne({
                    where: {
                        '$User.id$': authenticated.id
                    },
                    include: [{
                        association: 'User'
                    }]
                })
                if (houseUser && houseUser.HouseId) {
                    const house = await models.House.findOne({
                        where: {
                            id: houseUser.HouseId
                        },
                        include: [
                            { model: models.HouseUser, as: 'Roommates', include: { model: models.User, as: 'User'},},
                            { model: models.Task, as: 'Tasks', include: { model: models.HouseUser, as: 'Active', include: {model: models.User, as: 'User'}}}
                        ]
                    })
                    
                    return {status: 200, house: house};
                }

                return {status: 404, house: null}
            }
            return {status: 401, house: null}
        },
        async getHouse(root, {houseUUID}, {token, models}) {

            const authenticated = await jwtAuth(token);
            if (authenticated) {
                const house = await models.House.findOne({
                    where: {
                        uuid: houseUUID
                    }
                })

                if (house) {
                    return {status: 200, house: house}
                }

                return {status: 404, house: null}
            }

            return {status: 401}
        }
    },
    Mutation: {
        async createHouse(root, {name}, {models, token}) {
            const authenticated = await jwtAuth(token);
            if (authenticated) {

                let user = await models.User.findOne({
                    where: {
                        id: authenticated.id
                    }
                })

                let houseUser = await models.HouseUser.findOne({
                    where: {
                        '$User.id$': authenticated.id
                    },
                    include: [{
                        association: 'User'
                    }]
                })

                if (houseUser && houseUser.HouseId) {
                    return {status: 409}
                } else if (!houseUser) {
                    houseUser = await models.HouseUser.create({
                        status: 'owner',
                    })

                    houseUser.setUser(user)
                }

                const house = await models.House.create({
                    name: name,
                })

                house.setRoommates([houseUser])

                return {status: 201};
            }

            return {status: 401}
        },
        async joinHouse(root, {houseUUID}, {models, token}) {
            const authenticated = await jwtAuth(token);
            if (authenticated) {

                let user = await models.User.findOne({
                    where: {
                        id: authenticated.id
                    }
                })

                let houseUser = await models.HouseUser.findOne({
                    where: {
                        '$User.id$': authenticated.id
                    },
                    include: [{
                        association: 'User'
                    }]
                })

                if (houseUser && houseUser.HouseId) {
                    return {status: 409}
                } else if (!houseUser) {
                    houseUser = await models.HouseUser.create({
                        status: 'pending',
                    })

                    houseUser.setUser(user)
                }

                const house = await models.House.findOne({
                    where: {
                        uuid: houseUUID
                    }
                })

                house.addRoommates(houseUser)

                return {status: 201};
            }


            return {status: 401}
        },
        async updateHouseStatus(root, {userUUID, status}, {models, token}) {

            const authenticated = await jwtAuth(token);
            if (authenticated) {
                let houseUser = await models.HouseUser.findOne({
                    where: {
                        '$User.id$': authenticated.id
                    },
                    include: [{
                        association: 'User'
                    }]
                })

                if (!houseUser || houseUser.status !== 'owner') {
                    return {status: 403}
                }

                let updatedHouseUser = await models.HouseUser.findOne({
                    where: {
                        '$User.uuid$': userUUID
                    },
                    include: [{
                        association: 'User'
                    }]
                })

                if (updatedHouseUser) {

                    console.log(updatedHouseUser)
                    updatedHouseUser.status = status
                    updatedHouseUser.save()

                    return {status: 200};
                }

                return {status: 404};
            }

            return {status: 401}
        }
    }
}

module.exports = {
    House,
    HouseResolver
}

