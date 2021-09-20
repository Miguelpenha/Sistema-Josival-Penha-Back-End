// Importações
    const express = require('express')
    const financeiro = express.Router()
    // Middlewares

    // Models
        
    // Routes
        const despesasRouter = require('./despesas')
// Confi
    // Middlewares
// Grupo de rotas
    financeiro.use('/despesas', despesasRouter)
// Rotas solo
    
// Exportações
    module.exports = financeiro