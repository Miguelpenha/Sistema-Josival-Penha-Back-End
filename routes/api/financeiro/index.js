// Importações
    const express = require('express')
    const financeiro = express.Router()
    // Middlewares

    // Models
        const despesasModels = require('../../../models/financeiro/despesas')
        const receitasModels = require('../../../models/financeiro/receitas')
    // Routes
        const despesasRouter = require('./despesas')
        const receitasRouter = require('./receitas')
// Confi
    // Middlewares
// Grupo de rotas
    financeiro.use('/despesas', despesasRouter)
    financeiro.use('/receitas', receitasRouter)
// Rotas solo
    financeiro.get('/saldo', (req, res) => {
        const receitas = await receitasModels.find({})
        let totalReceitas = 0
        receitas.map(receita => {
            totalReceitas += receita.precoBruto
        })
        res.json({
            total: dinero({ amount: total, currency: 'BRL' }).toFormat(),
            totalBruto: total
        })
    })
// Exportações
    module.exports = financeiro