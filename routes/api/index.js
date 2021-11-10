// Importações
    const express = require('express')
    const api = express.Router()
    // Middlewares
        
    // Models

    // Routes
        const professorasRouter = require('./professoras')
        const administrativoRouter = require('./administrativo')
        const alunosRouter = require('./alunos')
        const turmasRouter = require('./turmas')
        const financeiroRouter = require('./financeiro')
// Config
    // Middlewares
        api.use((req, res, next) => {
            const keyBruta = req.header('Authorization') || req.body.keyapi
            
            if (keyBruta) {
                const key = keyBruta.replace('key ', '')
                const keysAuthorizeds = process.env.API_KEYS_AUTHORIZED.split(',')
                
                if (keysAuthorizeds.includes(key)) {
                    next()
                } else {
                    res.status(401)
                    res.json({'unauthorized': true})
                }
            } else {
                res.status(401)
                res.json({'unauthorized': true})
            }
        })
// Grupo de rotas
    api.use('/professoras', professorasRouter)
    api.use('/administrativo', administrativoRouter)
    api.use('/alunos', alunosRouter)
    api.use('/turmas', turmasRouter)
    api.use('/financeiro', financeiroRouter)
// Rotas solo

// Exportações
    module.exports = api