const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    nome: String,
    cor: String,
    permanent: {
        type: Boolean,
        default: false
    },
    criacao: {
        data: String,
        hora: String,
        sistema: Date
    }
})

const categoriasGastosModels = mongoose.model('categoriasGastos', schema)

module.exports = categoriasGastosModels