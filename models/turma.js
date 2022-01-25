const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    nome: String,
    serie: String,
    turno: String,
    professora: String,
    alunos: {
        type: Number,
        default: 0
    },
    criacao: {
        data: String,
        hora: String,
        sistema: Date
    }
})

const turmasModels = mongoose.model('turmas', schema)

module.exports = turmasModels