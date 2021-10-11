const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    nome: String,
    cor: String,
    criação: {
        data: String,
        hora: String,
        sistema: Date
    }
})

const categoriasReceitasModels = mongoose.model('categorias_receitas', schema)

module.exports = categoriasReceitasModels