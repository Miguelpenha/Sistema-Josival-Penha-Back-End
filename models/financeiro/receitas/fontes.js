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

const fontesReceitasModels = mongoose.model('fontes_receitas', schema)

module.exports = fontesReceitasModels