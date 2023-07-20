const { v1: uuid } = require('uuid')
const Book = require('./models/book')
const Author = require('./models/author')
const { GraphQLError } = require('graphql')

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
        addBook: async (root, args) => {
            const response = await Author.findOne({ name: args.author })
            if (!response) {
                if (args.author.length < 4) {
                    throw new GraphQLError(
                        'Name must be atleast 4 characters long',
                        {
                            extensions: {
                                code: 'BAD_USER_INPUT',
                                invalidArgs: args.author,
                            },
                        }
                    )
                } else if (args.title.length < 5) {
                    throw new GraphQLError(
                        'Title must be atleast 5 characters long',
                        {
                            extensions: {
                                code: 'BAD_USER_INPUT',
                                invalidArgs: args.title,
                            },
                        }
                    )
                } else if (await Book.findOne({ title: args.title })) {
                    throw new GraphQLError('Title must be unique', {
                        extensions: {
                            code: 'BAD_USER_INPUT',
                            invalidArgs: args.title,
                        },
                    })
                } else {
                    const newAuthor = new Author({
                        name: args.author,
                    })

                    await newAuthor.save()

                    const book = new Book({ ...args, author: newAuthor })
                    return book.save()
                }
            } else {
                const book = new Book({ ...args, author: response })
                return book.save()
            }
        },

        editAuthor: async (root, args) => {
            return Author.findOneAndUpdate(
                { name: args.author },
                { born: args.setBornTo },
                { new: true }
            )
        },
    },
}

module.exports = resolvers
