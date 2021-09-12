// Importações
    const express = require('express')
    const api = express.Router()
    // Middlewares
        
    // Models
// Config
    // Middlewares
        
// Routes
    const professorasRouter = require('./professoras')
    const administrativoRouter = require('./administrativo')
// Grupo de rotas
    api.use('/professoras', professorasRouter)
    api.use('/administrativo', administrativoRouter)
// Rotas solo

// Exportações
    module.exports = api