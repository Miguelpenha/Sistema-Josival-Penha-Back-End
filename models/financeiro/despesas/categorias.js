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

const categoriasDespesasModels = mongoose.model('categorias_despesas', schema)

module.exports = categoriasDespesasModels