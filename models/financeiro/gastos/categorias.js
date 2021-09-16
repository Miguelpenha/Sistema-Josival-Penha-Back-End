const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    nome: String,
    cor: String,
    criacao: {
        data: String,
        hora: String,
        sistema: Date
    }
})

const categoriasGastosModels = mongoose.model('categorias_gastos', schema)

module.exports = categoriasGastosModels