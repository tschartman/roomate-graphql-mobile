const {gql} = require('graphql-modules');
const jwtConfig = require('../../config/jwt');
const jwtAuth = require('../../middleware/jwtAuth');
const bcrypt = require('bcrypt');
const jwt = require('../../utils/jwt')

const Authentication = gql`
    type Authentication {
        status: Int
        jwt: String
    }

    type User {
        nickname: String
        uuid: String
        id: String
    }

    type MyUser {
        status: Int
        user: User
    }
`;

const AuthenticationResolver = {
    Query: {
        async authentication(root, {email, password}, {models}) {
            const auth = await models.Auth.findOne({
                where: {
                  email: email
                }
              });
            
              if (auth) {
                const isMatched = await bcrypt.compare(password, auth.password);
                if (isMatched) {
                  const token = jwt.createToken({id: auth.id});
                  return {
                    status: 200, jwt: token
                  }
                }
                return {status: 403, jwt: null}
              }
            
              return {status: 404, jwt: null}
        },
        async getUser(root, args, {models, token}) {
            const authenticated = await jwtAuth(token);
            if (authenticated) {
              const user = await models.User.findOne({
                where: {
                  id: authenticated.id
                },
                include: 'Auth'
              })
              return {status: 200, user: user}
            }
            return {status: 401, user: null}
        },
    },
    Mutation: {
        async register(root, {nickname, email, password}, {models}) {
            const isExist = await models.Auth.findOne({
                where: {
                  email: email
                }
              })
            
            if (isExist) {
                return {status: 409}
            }
      
            const hashedPassword = await bcrypt.hash(password, 10)

            await models.User.create({
                nickname: nickname,
                Auth: {
                  email: email,
                  password: hashedPassword
                }
            }, {
                include: [{
                  association: 'Auth',
                }]
            })

            return {status: 201}
        },
    }
}

module.exports = {
    Authentication,
    AuthenticationResolver
}