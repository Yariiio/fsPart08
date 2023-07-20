const mongoose = require('mongoose')
require('dotenv').config()

mongoose.set('strictQuery', false)

const connectDB = () => {
    mongoose
        .connect(process.env.MONGODB_URI)
        .then(() => {
            console.log('connected to database')
        })
        .catch((error) => {
            console.log('Can not connect to database', error.message)
        })
}

module.exports = connectDB
