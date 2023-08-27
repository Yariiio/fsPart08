const { v1: uuid } = require('uuid')
const Book = require('./models/book')
const Author = require('./models/author')
const User = require('./models/user')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const { PubSub } = require('graphql-subscriptions')
const author = require('./models/author')
const pubsub = new PubSub()

const resolvers = {
    Query: {
        bookCount: async () => Book.collection.countDocuments(),
        authorCount: async () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
            if (args.genre) {
                return Book.find({ genres: args.genre })
            }
            return Book.find({})
        },
        allAuthors: async () => {
            const authors = await Author.find({})
            const books = await Book.find({}).populate('author')

            return authors.map((a) => {
                return {
                    name: a.name,
                    born: a.born,
                    id: a._id,
                    bookCount: books.filter(
                        (book) => book.author.name === a.name
                    ).length,
                }
            })
        },
        me: (root, args, context) => {
            return context.currentUser
        },
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
                    const book = new Book({ ...args, author: newAuthor })
                    try {
                        await newAuthor.save()
                        await book.save()
                    } catch (error) {
                        throw new GraphQLError(error.message, {
                            extensions: {
                                invalidArgs: args,
                                error,
                            },
                        })
                    }
                    pubsub.publish('BOOK_ADDED', { bookAdded: book })
                    return book
                } else {
                    const book = new Book({ ...args, author: existingAuthor })
                    try {
                        await book.save()
                    } catch (error) {
                        throw new GraphQLError(error.message, {
                            extensions: {
                                invalidArgs: args,
                            },
                        })
                    }
                    pubsub.publish('BOOK_ADDED', { bookAdded: book })
                    return book
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
            try {
                return user.save()
            } catch (error) {
                throw new GraphQLError('creating the user failed', {
                    extensions: {
                        code: 'BAD_USER_INPUT',
                        invalidArgs: args.name,
                        error,
                    },
                })
            }
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

            return {
                value: jwt.sign(userForToken, process.env.SECRET),
            }
        },
    },

    Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator('BOOK_ADDED'),
        },
    },
}

module.exports = resolvers
