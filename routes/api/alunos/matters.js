const express = require('express')
const matters = express.Router()
const alunosModels = require('../../../models/aluno')

matters.post('/', async (req, res) => {
    const { id, matters } = req.body

    const aluno = await alunosModels.findById(id)
    aluno.matérias = matters

    await aluno.save()

    res.json({ modified: true })
})

module.exports = matters