const { v1: uuid } = require('uuid')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')

const resolvers = {
    Query: {
        bookCount: async () => Book.collection.countDocuments(),
        authorCount: async () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            if (args.genre) {
                return Book.find({ genres: [args.genre] })
            }
            return Book.find({})
        },
        allAuthors: async () => Author.find({}),
        me: (root, args, context) => {
            return context.currentUser
        },
    },

    Author: {
        bookCount: async (root) =>
            (await Book.find({ author: root._id })).length,
    },
    Book: {
        author: async (root) => {
            return Author.findOne({ _id: root.author })
        },
    },

    Mutation: {
        addBook: async (root, args, context) => {
            const currentUser = context.currentUser
            if (currentUser) {
                const existingAuthor = await Author.findOne({
                    name: args.author,
                })
                if (args.author.length < 4) {
                    throw new GraphQLError('Authors name too short')
                }
                if (args.title.length < 5) {
                    throw new GraphQLError('Books title too short')
                }
                if (!existingAuthor) {
                    const newAuthor = new Author({ name: args.author })
                    try {
                        await newAuthor.save()
                        const book = new Book({ ...args, author: newAuthor })
                        return book.save()
                    } catch (error) {
                        throw new GraphQLError(error.message, {
                            extensions: {
                                invalidArgs: args,
                            },
                        })
                    }
                } else {
                    const book = new Book({ ...args, author: existingAuthor })
                    try {
                        return book.save()
                    } catch (error) {
                        throw new GraphQLError(error.message, {
                            extensions: {
                                invalidArgs: args,
                            },
                        })
                    }
                }
            } else {
                throw new GraphQLError('not authenticated', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                })
            }
        },

        editAuthor: async (root, args, context) => {
            const currentUser = context.currentUser
            if (currentUser) {
                try {
                    const author = await Author.findOne({ name: args.author })
                    author.born = args.setBornTo
                    return author.save()
                } catch (error) {
                    throw new GraphQLError('updating user failed', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: args.name,
                            error,
                        },
                    })
                }
            } else {
                throw new GraphQLError('not authenticated', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                })
            }
        },

        createUser: async (root, args) => {
            const user = new User({
                username: args.username,
                favoriteGenre: args.favoriteGenre,
            })

            return user.save().catch((error) => {
                throw new GraphQLError('creating the user failed', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.name,
                        error,
                    },
                })
            })
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })
            if (!user || args.password !== 'mysecret') {
                throw new GraphQLError('wrong credentials', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                    },
                })
            }

            const userForToken = {
                username: user.username,
                id: user._id,
            }

            return { value: jwt.sign(userForToken, process.env.SECRET) }
        },
    },
}

module.exports = resolvers
