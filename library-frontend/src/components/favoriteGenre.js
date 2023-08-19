import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ME } from '../queries'

const FavoriteGenre = ({ show }) => {
    const currentUser = useQuery(ME, { pollInterval: 500 })
    const books = useQuery(ALL_BOOKS)

    if (currentUser.loading) return <div>loading...</div>

    if (!show) return null

    return (
        <div>
            <h2>Recommendations</h2>
            <p>
                books in your favorite genre{' '}
                <strong>{currentUser.data.me.favoriteGenre}</strong>
            </p>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>author</th>
                        <th>published</th>
                    </tr>
                    {books.data.allBooks
                        .filter((book) =>
                            book.genres.includes(
                                currentUser.data.me.favoriteGenre
                            )
                        )
                        .map((b) => (
                            <tr key={b.title}>
                                <td>{b.title}</td>
                                <td>{b.author.name}</td>
                                <td>{b.published}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    )
}

export default FavoriteGenre
