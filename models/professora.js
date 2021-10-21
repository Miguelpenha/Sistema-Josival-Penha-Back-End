const mongoose = require('mongoose')
const criptografar = require('../utils/criptografia/criptografar')
const descriptografar = require('../utils/criptografia/descriptografar')

const schema = new mongoose.Schema({
    nome: String,
    sexo: String,
    login: {
        type: String,
        get: descriptografar,
        set: criptografar
    },
    senha: {
        type: String,
        get: descriptografar,
        set: criptografar
    },
    turmas: {
        type: Number,
        default: 0
    },
    criação: {
        data: String,
        hora: String,
        sistema: Date
    }
}, {
    toJSON: {
        getters: true
    }
})

schema.pre('deleteOne', {document: true}, async function(next) {
    next()
})

const professorasModels = mongoose.model('professoras', schema)

module.exports = professorasModels