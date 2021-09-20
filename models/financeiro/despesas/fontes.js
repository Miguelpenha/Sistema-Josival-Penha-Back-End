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

const fontesDespesas = mongoose.model('fontes_gastos', schema)

module.exports = fontesDespesas