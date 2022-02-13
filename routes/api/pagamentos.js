const express = require('express')
const pagamentos = express.Router()
const alunosModels = require('../../models/aluno')

pagamentos.get('/:id', async (req, res) => {
    const { id } = req.params

    const pagamentos = (await alunosModels.findById(id)).pagamentos

    res.json(pagamentos)
})

pagamentos.post('/', async (req, res) => {
    const { id, mês, value, pago, vencimento, forma } = req.body

    const pagamentos = (await alunosModels.findById(id)).pagamentos

    res.json(pagamentos[mês])
})

module.exports = pagamentos