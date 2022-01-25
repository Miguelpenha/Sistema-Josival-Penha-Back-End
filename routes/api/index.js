const express = require('express')
const api = express.Router()
const professorasRouter = require('./professoras')
const administrativoRouter = require('./administrativo')
const alunosRouter = require('./alunos')
const turmasRouter = require('./turmas')
const financeiroRouter = require('./financeiro')
const emailsRouter = require('./emails')
const notificationsRouter = require('./notifications')
const veriCep = require('../../utils/veriCep')
const middlewareAPI = require('../../middlewares/middlewareAPI')

api.use(middlewareAPI)
api.use('/professoras', professorasRouter)
api.use('/administrativo', administrativoRouter)
api.use('/alunos', alunosRouter)
api.use('/turmas', turmasRouter)
api.use('/financeiro', financeiroRouter)
api.use('/emails', emailsRouter)
api.use('/notifications', notificationsRouter)

api.get('/cep/:cep', async (req, res) => {
    const endereço = await veriCep(req.params.cep)

    res.json(endereço)
})

module.exports = api