const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    nome: String,
    preco: String,
    precoBruto: Number,
    categorias: [String],
    fontes: [String],
    data: String,
    dataSistema: Date,
    investimento: Boolean,
    fixa: Boolean,
    observação: String,
    criação: {
        data: String,
        hora: String,
        sistema: Date
    }
})

const despesasModels = mongoose.model('despesas', schema)

module.exports = despesasModels