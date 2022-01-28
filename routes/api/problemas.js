const express = require('express')
const problemas = express.Router()
const problemasModels = require('../../models/problema')
const mongoose = require('mongoose')

problemas.get('/', async (req, res) => {
    if (req.query.quant) {
        const problemas = await problemasModels.find({}).select('id')

        res.json({quant: problemas.length})
    } else {
        const problemas = await problemasModels.find({})

        res.json(problemas)
    }
})

problemas.post('/', async (req, res) => {
    const { nameUser, título, problema, urgente, criação } = req.body

    problemasModels.create({
        nameUser,
        título,
        problema,
        urgente,
        criacao: {
            data: new Date(criação).toLocaleDateString(),
            hora: new Date(criação).toLocaleTimeString().split(':')[0]+':'+new Date(criação).toLocaleTimeString().split(':')[1],
            sistema: new Date(criação).toISOString()
        }
    }).then(() => res.json({created: true}))
    .catch(() => res.status(400).json({error: 'Houve um erro ao criar o problema'}))
})

problemas.delete('/:id', async (req, res) => {
    const { id } = req.params

    if (mongoose.isValidObjectId(id)) {
        const problema = await problemasModels.findById(id)
        
        if (problema) {
            problema.deleteOne()

            res.json({deleted: true})
        } else {
            res.json({exists: false})
        }
    } else {
        res.json({exists: false})
    }
})

module.exports = problemas 