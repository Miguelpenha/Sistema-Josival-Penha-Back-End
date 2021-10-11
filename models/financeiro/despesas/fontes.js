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

const fontesDespesasModels = mongoose.model('fontes_despesas', schema)

module.exports = fontesDespesasModels