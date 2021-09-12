const mongoose = require('mongoose')
const categoriasGastos = require('../../../utils/categoriasGastos')
const data = require('../../../utils/data')

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