const { gql } = require('graphql-modules');
const jwtAuth = require('../../middleware/jwtAuth');

const Task = gql`
    type Tasks {
        status: Int
        tasks: [Task]
    }

    type Task {
        name: String
        color: String
        uuid: String
        Active: Roommate
        Records: [TaskRecord]
    }

    type TaskRecord {
        timestamp: String
        uuid: String
        houseUser: Roommate
    }
`

const TaskResolver = {
    Query: {
        async getTasks(root, args, {models, token}) {
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

                if (houseUser) {
                    let house = await models.House.findOne({
                        where: {
                            id: houseUser.HouseId
                        },
                        include: [
                            { 
                                model: models.Task,
                                as: 'Tasks',
                                include: [
                                    {
                                        model: models.Record,
                                        as: 'Records',
                                        include: {
                                            model: models.HouseUser,
                                            as: 'houseUser',
                                            include: {
                                                model: models.User,
                                                as: 'User'
                                            }
                                        },
                                    }, {
                                        model: models.HouseUser,
                                        as: 'Active',
                                        include: {
                                            model: models.User,
                                            as: 'User'
                                        }
                                    }
                                ],
                            }
                        ]
                    })
    
                    if (house) {
                        return {status: 200, tasks: house.Tasks}    
                    }

                    return {status: 404, tasks: null}
                }

                return {status: 404, tasks: null}
            }

            return {status: 401, tasks: null}
        }
    },
    Mutation: {
        async createTask(root, {name, color}, {models, token}) {
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

                if (houseUser && houseUser.status === 'owner') {
                    let house = await models.House.findOne({
                        where: {
                            id: houseUser.HouseId
                        },
                        include: [{
                            association: 'Tasks'
                        }]
                    })

                    let newTask = await models.Task.create({
                        name: name,
                        color: color
                    });


                    newTask.setActive(houseUser)
                    house.addTasks(newTask);

                    return {status: 201};
                }

                return {status: 403}
            }
            return {status: 401}
        },
        async completeTask(root, {taskUUID}, {models, token}) {

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

                let task = await models.Task.findOne({
                    where: {
                        uuid: taskUUID
                    },
                    include: { 
                        model: models.HouseUser, as: 'Active', include: {model: models.User, as: 'User'}
                    }
                })

                if (houseUser && task) {
                    let house = await models.House.findOne({
                        where: {
                            id: houseUser.HouseId
                        },
                        include: [
                            { model: models.HouseUser, as: 'Roommates', include: { model: models.User, as: 'User'},},
                        ]
                    })

                    if (task.Active.id === houseUser.id) {
                        newRecord = await models.Record.create()
                        newRecord.setHouseUser(houseUser)

                        task.addRecords(newRecord)
    

                        if (house.Roommates.length > 1) {

                            let nextActiveIndex = house.Roommates.findIndex(roommate =>
                                 roommate.id === houseUser.id
                            )

                            if (nextActiveIndex !== -1) {
                                nextActiveIndex = (nextActiveIndex + 1) % house.Roommates.length
                                let nextActive = house.Roommates[nextActiveIndex]
                                task.setActive(nextActive)

                                return {status: 201};
                            }

                        }

                        return {status: 201};
                    }

                    return {status: 403}
                }

                return {status: 404}
            }
            return {status: 401}
        }
    }
}

module.exports = {
    Task,
    TaskResolver
}