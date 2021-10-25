// Importações
    const express = require('express')
    const turmas = express.Router()
    // Middlewares
        
    // Models
        const turmasModels = require('../../models/turma')
        const professorasModels = require('../../models/professora')
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
    
    turmas.post('/', async (req, res) => {
        const { nome, serie, turno, professora, criação } = req.body

        const turma = await turmasModels.findOne({nome})
        if (turma) {
            res.json({error: 'Já existe uma turma com esse nome'})
        } else {
            turmasModels.create({
                nome,
                serie,
                turno,
                professora,
                criacao: {
                    data: new Date(criação).toLocaleDateString(),
                    hora: new Date(criação).toLocaleTimeString().split(':')[0]+':'+new Date(criação).toLocaleTimeString().split(':')[1],
                    sistema: new Date(criação).toISOString()
                }
            }).then(async () => {
                const professora = await professorasModels.findOne({nome: req.body.professora})
                professora.turmas = professora.turmas+1
                professora.save()
                .then(() => res.json({created: true}))
                .catch(() => res.json({error: 'Houve um erro ao criar a turma'}))
            }).catch(() => res.json({error: 'Houve um erro ao criar a turma'}))
        }
    })
// Exportações
    module.exports = turmas 