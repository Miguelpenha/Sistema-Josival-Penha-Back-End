const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    nameUser: String,
    título: String,
    problema: String,
    urgente: Boolean,
    criacao: {
        data: String,
        hora: String,
        sistema: Date
    }
})

const problemasModels = mongoose.model('problemas', schema)

module.exports = problemasModels