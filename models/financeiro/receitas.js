const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    nome: String,
    preco: String,
    precoBruto: Number,
    data: String,
    dataSistema: Date,
    investimento: Boolean,
    fixa: Boolean,
    fixaDay: String,
    observação: String,
    criação: {
        data: String,
        hora: String,
        sistema: Date
    }
})

const receitasModels = mongoose.model('receitas', schema)

module.exports = receitasModels