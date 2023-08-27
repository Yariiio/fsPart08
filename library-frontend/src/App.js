import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import FavoriteGenre from './components/favoriteGenre'
import { useApolloClient } from '@apollo/client'
import { useSubscription } from '@apollo/client'
import { BOOK_ADDED, ALL_BOOKS } from './queries'

export const updateCache = (cache, query, addedBook) => {
    // helper that is used to eliminate saving same person twice
    const uniqByTitle = (a) => {
        let seen = new Set()
        return a.filter((item) => {
            let k = item.title
            return seen.has(k) ? false : seen.add(k)
        })
    }

    cache.updateQuery(query, ({ allBooks }) => {
        return {
            allBooks: uniqByTitle(allBooks.concat(addedBook)),
        }
    })
}

const App = () => {
    const [page, setPage] = useState('authors')
    const [token, setToken] = useState(
        localStorage.getItem('bookapp-user-token') || null
    )
    const client = useApolloClient()

    const logout = () => {
        setToken(null)
        localStorage.clear()
        client.resetStore()
        setPage('books')
    }

    useSubscription(BOOK_ADDED, {
        onData: ({ data }) => {
            console.log(data)
            const addedBook = data.data.bookAdded
            window.alert(`${addedBook.title} added`)
            setPage('books')

            updateCache(client.cache, { query: ALL_BOOKS }, addedBook)
        },
    })

    return (
        <div>
            <div>
                <button onClick={() => setPage('authors')}>authors</button>
                <button onClick={() => setPage('books')}>books</button>
                {token ? (
                    <>
                        <button onClick={() => setPage('add')}>add book</button>
                        <button onClick={() => setPage('recommend')}>
                            recommend
                        </button>
                        <button onClick={logout}>logout</button>
                    </>
                ) : (
                    <button onClick={() => setPage('login')}>login</button>
                )}
            </div>

            <Authors show={page === 'authors'} />

            <Books show={page === 'books'} />

            <NewBook show={page === 'add'} />

            <LoginForm show={page === 'login'} setToken={setToken} />
            <FavoriteGenre show={page === 'recommend'} token={token} />
        </div>
    )
}

export default App
