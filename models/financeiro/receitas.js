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
    months: {
        '01': {
            preco: String,
            precoBruto: Number,
            observação: String
        },
        '02': {
            valueBruto: Number,
            value: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            descrição: String,
            forma: String
        },
        '03': {
            valueBruto: Number,
            value: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            descrição: String,
            forma: String
        },
        '04': {
            valueBruto: Number,
            value: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            descrição: String,
            forma: String
        },
        '05': {
            valueBruto: Number,
            value: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            descrição: String,
            forma: String
        },
        '06': {
            valueBruto: Number,
            value: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            descrição: String,
            forma: String
        },
        '07': {
            valueBruto: Number,
            value: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            descrição: String,
            forma: String
        },
        '08': {
            valueBruto: Number,
            value: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            descrição: String,
            forma: String
        },
        '09': {
            valueBruto: Number,
            value: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            descrição: String,
            forma: String
        },
        '10': {
            valueBruto: Number,
            value: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            descrição: String,
            forma: String
        },
        '11': {
            valueBruto: Number,
            value: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            descrição: String,
            forma: String
        },
        '12': {
            valueBruto: Number,
            value: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            descrição: String,
            forma: String
        }
    },
    criação: {
        data: String,
        hora: String,
        sistema: Date
    }
})

const receitasModels = mongoose.model('receitas', schema)

module.exports = receitasModels