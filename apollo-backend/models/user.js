const mongoose = require('mongoose')

const userSchema = new mongoose.Model({
    username: {
        type: String,
        required: true,
        minLength: 3,
    },
})

module.exports('User', userSchema)
