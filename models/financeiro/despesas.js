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
            precoBruto: Number,
            preco: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            observação: String
        },
        '02': {
            precoBruto: Number,
            preco: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            observação: String
        },
        '03': {
            precoBruto: Number,
            preco: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            observação: String
        },
        '04': {
            precoBruto: Number,
            preco: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            observação: String
        },
        '05': {
            precoBruto: Number,
            preco: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            observação: String
        },
        '06': {
            precoBruto: Number,
            preco: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            observação: String
        },
        '07': {
            precoBruto: Number,
            preco: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            observação: String
        },
        '08': {
            precoBruto: Number,
            preco: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            observação: String
        },
        '09': {
            precoBruto: Number,
            preco: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            observação: String
        },
        '10': {
            precoBruto: Number,
            preco: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            observação: String
        },
        '11': {
            precoBruto: Number,
            preco: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            observação: String
        },
        '12': {
            precoBruto: Number,
            preco: String,
            pago: Boolean,
            vencimento: String,
            vencimentoSistema: Date,
            observação: String
        }
    },
    criação: {
        data: String,
        hora: String,
        sistema: Date
    }
})

const despesasModels = mongoose.model('despesas', schema)

module.exports = despesasModels