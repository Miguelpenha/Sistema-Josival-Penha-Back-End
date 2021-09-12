// Importações
    const express = require('express')
    const financeiro = express.Router()
    // Middlewares
        const veriMiddleware = require('../../middlewares/middlewares')
    // Models
        const gastosModels = require('../../models/financeiro/gastos/gastos')
    // Middlewares
        financeiro.use(veriMiddleware.login)
        financeiro.use(veriMiddleware.voltar)
    // Routes
        const gastosRouter = require('./gastos/gastos')
// Grupo de rotas
    financeiro.get('/gastos', gastosRouter)
// Rotas solo
    financeiro.get('/', async (req, res) => {
        const gastos = await gastosModels.find({})
        res.render('financeiro/financeiro', {gastos})
    })
// Exportações
    module.exports = financeiro