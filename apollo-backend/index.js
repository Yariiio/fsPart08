const { ApolloServer } = require('@apollo/server')

//const { startStandaloneServer } = require('@apollo/server/standalone')

const { expressMiddleware } = require('@apollo/server/express4')
const {
    ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer')
const { makeExecutableSchema } = require('@graphql-tools/schema')
const express = require('express')
const cors = require('cors')
const http = require('http')

const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

const resolvers = require('./resolvers')
const typeDefs = require('./typedefs')

const connectDB = require('./db')

const jwt = require('jsonwebtoken')
const User = require('./models/user')

connectDB()

const start = async () => {
    const app = express()
    const httpServer = http.createServer(app)

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/',
    })

    const schema = makeExecutableSchema({ typeDefs, resolvers })
    const serverCleanup = useServer({ schema }, wsServer)

    const server = new ApolloServer({
        schema,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose()
                        },
                    }
                },
            },
        ],
    })

    await server.start()

    app.use(
        '/',
        cors(),
        express.json(),
        expressMiddleware(server, {
            context: async ({ req, res }) => {
                const auth = req ? req.headers.authorization : null
                if (auth && auth.startsWith('Bearer ')) {
                    const decodedToken = jwt.verify(
                        auth.substring(7),
                        process.env.SECRET
                    )
                    const currentUser = await User.findById(decodedToken.id)
                    return { currentUser }
                }
            },
        })
    )
    const PORT = 4000

    httpServer.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`)
    )
}

start()

/*******USING STANDALONESERVER WAY******* 

const server = new ApolloServer({
    typeDefs,
    resolvers,
})

startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req, res }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer ')) {
            const decodedToken = jwt.verify(
                auth.substring(7),
                process.env.SECRET
            )
            const currentUser = await User.findById(decodedToken.id)
            return { currentUser }
        }
    },
}).then(({ url }) => {
    console.log(`Server ready at ${url}`)
})
*/
