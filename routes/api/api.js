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
    const alunosRouter = require('./alunos')
    const turmasRouter = require('./turmas')
// Grupo de rotas
    api.use('/professoras', professorasRouter)
    api.use('/administrativo', administrativoRouter)
    api.use('/alunos', alunosRouter)
    api.use('/turmas', turmasRouter)
// Rotas solo

// Exportações
    module.exports = api