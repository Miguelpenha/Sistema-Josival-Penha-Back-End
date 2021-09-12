const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    nome: String,
    preco: String,
    precoBruto: Number,
    categorias: [String],
    data: Date,
    investimento: Boolean,
    criacao: {
        data: String,
        hora: String,
        sistema: Date
    }
})

const gastosModels = mongoose.model('gastos', schema)

module.exports = gastosModels