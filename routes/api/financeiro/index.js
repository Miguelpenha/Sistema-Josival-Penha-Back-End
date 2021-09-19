// Importações
    const express = require('express')
    const financeiro = express.Router()
    // Middlewares

    // Models
        
    // Routes
        const gastosRouter = require('./gastos')
// Confi
    // Middlewares
// Grupo de rotas
    financeiro.use('/gastos', gastosRouter)
// Rotas solo
    
// Exportações
    module.exports = financeiro