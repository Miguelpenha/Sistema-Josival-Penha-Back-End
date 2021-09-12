// Importações
    const express = require('express')
    const categorias = express.Router()
    const dinero = require('dinero.js')
    // Úteis
        const data = require('../../../utils/data')
    // Middlewares
        const veriMiddleware = require('../../../middlewares/middlewares')
    // Models
        const gastosModels = require('../../../models/financeiro/gastos/gastos')
        const categoriasGastosModels = require('../../../models/financeiro/gastos/categorias')
    // Middlewares
        categorias.use(veriMiddleware.login)
        categorias.use(veriMiddleware.voltar)
// Config Geral
    // Dinero
        dinero.globalLocale = 'pt-br'
// Rotas solo
    categorias.get('/', async (req, res) => {
        const gastos = await gastosModels.find({}).sort({precoBruto: 'desc'})
        gastos.map((gasto, index) => {
            if (gastos.length-1 == index) {
                gasto.ultimo = true
            }
            return gasto
        })
        res.render('financeiro/gastos/gastos', {gastos: gastos, voltar: req.voltar})
    })

    categorias.get('/listar', async (req, res) => {
        const gastos = await categoriasGastosModels.find({}).sort({nome: 'desc'})
        res.json(gastos)
    })
// Exportações
    module.exports = categorias