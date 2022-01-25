const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    title: String,
    message: String,
    admin: Boolean,
    icon: String,
    created: {
        data: String,
        hora: String,
        sistema: Date
    }
})

const notificationsModels = mongoose.model('notifications', schema)

module.exports = notificationsModels