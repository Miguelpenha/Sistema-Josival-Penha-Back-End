// Importações
    const express = require('express')
    const financeiro = express.Router()
    const dinero = require('dinero.js')
    // Middlewares
        const middlewareAPI = require('../../../middlewares/middlewareAPI')
    // Models
        const despesasModels = require('../../../models/financeiro/despesas')
        const receitasModels = require('../../../models/financeiro/receitas')
    // Routes
        const despesasRouter = require('./despesas')
        const receitasRouter = require('./receitas')
// Confi
    // Dinero
        dinero.globalLocale = 'pt-br'
    financeiro.use(middlewareAPI)
// Grupo de rotas
    financeiro.use('/despesas', despesasRouter)
    financeiro.use('/receitas', receitasRouter)
// Rotas solo
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
// Exportações
    module.exports = financeiro