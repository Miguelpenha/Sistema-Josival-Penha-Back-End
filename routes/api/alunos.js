// Importações
    const express = require('express')
    const alunos = express.Router()
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
// Exportações
    module.exports = alunos