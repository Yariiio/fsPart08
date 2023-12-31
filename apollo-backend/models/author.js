const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 4,
    },
    born: {
        type: Number,
        default: null,
    },
})

module.exports = mongoose.model('Author', authorSchema)
