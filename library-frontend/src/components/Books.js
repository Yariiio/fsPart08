import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Books = (props) => {
    const [byGenre, setBygenre] = useState(null)
    const books = useQuery(ALL_BOOKS, {
        variables: { genre: byGenre },
    })
    //Getting query with all possible genres
    const allBooksResult = useQuery(ALL_BOOKS)

    if (!props.show) {
        return null
    }

    if (books.loading) return <div>loading...</div>

    const genres = [
        ...new Set(
            allBooksResult.data.allBooks.map((book) => book.genres).flat()
        ),
    ]

    return (
        <div>
            <h2>books</h2>

            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>author</th>
                        <th>published</th>
                    </tr>
                    {books.data.allBooks.map((b) => (
                        <tr key={b.title}>
                            <td>{b.title}</td>
                            <td>{b.author.name}</td>
                            <td>{b.published}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                {genres.map((genre, index) => (
                    <button
                        onClick={() => {
                            setBygenre(genre)
                        }}
                        key={index}
                    >
                        {genre}
                    </button>
                ))}
                <button onClick={() => setBygenre(null)}>
                    <strong>all genres</strong>
                </button>
            </div>
        </div>
    )
}

export default Books
