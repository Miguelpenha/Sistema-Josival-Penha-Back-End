// Importações
    const express = require('express')
    const financeiro = express.Router()
    // Middlewares

    // Models
        
    // Routes
        const despesasRouter = require('./despesas')
        const receitasRouter = require('./receitas')
// Confi
    // Middlewares
// Grupo de rotas
    financeiro.use('/despesas', despesasRouter)
    financeiro.use('/receitas', receitasRouter)
// Rotas solo
    
// Exportações
    module.exports = financeiro