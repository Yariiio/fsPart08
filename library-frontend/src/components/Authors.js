import { ALL_AUTHORS } from '../queries'
import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
import { EDIT_AUTHOR } from '../queries'
import Select from 'react-select'

const Authors = (props) => {
    const [born, setBorn] = useState('')
    const [name, setName] = useState('')

    const authors = useQuery(ALL_AUTHORS)
    const [editAuthor] = useMutation(EDIT_AUTHOR, {
        refetchQueries: [{ query: ALL_AUTHORS }],
    })

    if (!props.show) {
        return null
    }

    if (authors.loading) return <div>loading...</div>

    //Options for Select tag
    const options = () => {
        const result = []
        const authorsArr = authors.data.allAuthors.map((author) => author.name)
        authorsArr.forEach((a) => result.push({ value: a, label: a }))
        return result
    }

    const handleSubmit = (event) => {
        event.preventDefault()

        editAuthor({
            variables: { author: name.label, setBornTo: Number(born) },
        })
    }

    return (
        <div>
            <h2>authors</h2>
            <table>
                <tbody>
                    <tr>
                        <th></th>
                        <th>born</th>
                        <th>books</th>
                    </tr>
                    {authors.data.allAuthors.map((a) => (
                        <tr key={a.name}>
                            <td>{a.name}</td>
                            <td>{a.born}</td>
                            <td>{a.bookCount}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <form onSubmit={handleSubmit}>
                <Select
                    defaultValue={name}
                    onChange={setName}
                    options={options()}
                />
                born
                <input
                    type='text'
                    value={born}
                    onChange={({ target }) => setBorn(target.value)}
                />
                <button type='submit'>update author</button>
            </form>
        </div>
    )
}

export default Authors
