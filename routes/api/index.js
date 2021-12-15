// Importações
    const express = require('express')
    const api = express.Router()
    // Routes
        const professorasRouter = require('./professoras')
        const administrativoRouter = require('./administrativo')
        const alunosRouter = require('./alunos')
        const turmasRouter = require('./turmas')
        const financeiroRouter = require('./financeiro')
    // Utils
        const veriCep = require('../../utils/veriCep')
    // Middlewares
        const middlewareAPI = require('../../middlewares/middlewareAPI')
// Config
    // Middlewares
        api.use(middlewareAPI)
// Grupo de rotas
    api.use('/professoras', professorasRouter)
    api.use('/administrativo', administrativoRouter)
    api.use('/alunos', alunosRouter)
    api.use('/turmas', turmasRouter)
    api.use('/financeiro', financeiroRouter)
// Rotas solo
    api.get('/cep/:cep', async (req, res) => {
        const endereço = await veriCep(req.params.cep)

        res.json(endereço)
    })
// Exportações
    module.exports = api