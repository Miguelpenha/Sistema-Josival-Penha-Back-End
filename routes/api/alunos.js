// Importações
    const express = require('express')
    const alunos = express.Router()
    const mongoose = require('mongoose')
    // Middlewares
        
    // Models
        const alunosModels = require('../../models/aluno')
// Confi
    // Middlewares
// Grupo de rotas

// Rotas solo
    alunos.get('/', async (req, res) => {
        if (req.query.quant) {
            const alunos = await alunosModels.find({}).select('id')
            
            res.json({quant: alunos.length})
        } else {
            const alunos = await alunosModels.find({})

            res.json(alunos)
        }
    })

    alunos.delete('/:id', async (req, res) => {
        if (mongoose.isValidObjectId(req.params.id)) {
            const aluno = await alunosModels.findById(req.params.id)
            if (aluno) {
                aluno.deleteOne()
                res.json({deleted: true})
            } else {
                res.json({exists: false})
            }
        } else {
            res.json({exists: false})
        }
    })
// Exportações
    module.exports = alunos