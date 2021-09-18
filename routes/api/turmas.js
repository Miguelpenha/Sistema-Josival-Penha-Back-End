// Importações
    const express = require('express')
    const turmas = express.Router()
    // Middlewares
        
    // Models
        const turmasModels = require('../../models/turma')
// Confi
    // Middlewares

    // Grupo de rotas

// Rotas solo
    turmas.get('/', async (req, res) => {
        if (req.query.quant) {
            const turmas = await turmasModels.find({}).select('id')

            res.json({quant: turmas.length})
        } else {
            const turmas = await turmasModels.find({})

            res.json(turmas)
        }
    })
// Exportações
    module.exports = turmas 