import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
    query {
        allAuthors {
            name
            born
            bookCount
            id
        }
    }
`

export const ALL_BOOKS = gql`
    query ($genre: String) {
        allBooks(genre: $genre) {
            title
            published
            author {
                name
                bookCount
                born
            }
            genres
        }
    }
`

export const ADD_BOOK = gql`
    mutation (
        $title: String!
        $published: Int!
        $author: String!
        $genres: [String!]!
    ) {
        addBook(
            title: $title
            published: $published
            author: $author
            genres: $genres
        ) {
            title
            published
            author {
                name
                bookCount
                born
            }
        }
    }
`
export const EDIT_AUTHOR = gql`
    mutation ($author: String!, $setBornTo: Int!) {
        editAuthor(author: $author, setBornTo: $setBornTo) {
            name
            born
            bookCount
        }
    }
`

export const LOGIN = gql`
    mutation ($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            value
        }
    }
`
export const ME = gql`
    query {
        me {
            username
            favoriteGenre
        }
    }
`

export const BOOK_ADDED = gql`
    subscription {
        bookAdded {
            title
            published
            genres
            author {
                name
                bookCount
                born
            }
        }
    }
`
