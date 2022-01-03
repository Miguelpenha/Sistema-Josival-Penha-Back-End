const express = require('express')
const financeiro = express.Router()
const dinero = require('dinero.js')
const despesasModels = require('../../../models/financeiro/despesas')
const receitasModels = require('../../../models/financeiro/receitas')
const despesasRouter = require('./despesas')
const receitasRouter = require('./receitas')

dinero.globalLocale = 'pt-br'

financeiro.use('/despesas', despesasRouter)
financeiro.use('/receitas', receitasRouter)

financeiro.get('/saldo', async (req, res) => {
    const receitas = await receitasModels.find({})
    const despesas = await despesasModels.find({})
    let totalReceitas = 0
    let totalDespesas = 0
    receitas.map(receita => totalReceitas += receita.precoBruto)
    despesas.map(despesa => totalDespesas += despesa.precoBruto)
    const saldo = totalReceitas - totalDespesas

    res.json({
        saldo: dinero({ amount: saldo, currency: 'BRL' }).toFormat(),
        saldoBruto: saldo
    })
})

financeiro.post('/verify', async (req, res) => {
    const { password } = req.body

    if (password === process.env.PASSWORD_FINANCE) {
        res.json({authorized: true})
    } else {
        res.json({authorized: false})
    }
})

module.exports = financeiro