// Importações
    const express = require('express')
    const turmas = express.Router()
    const mongoose = require('mongoose')
    // Middlewares
        
    // Models
        const turmasModels = require('../../models/turma')
        const professorasModels = require('../../models/professora')
        const alunosModels = require('../../models/aluno')
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

    turmas.get('/alunos/:id', async (req, res) => {
        const alunos = await alunosModels.find({turma: req.params.id})

        res.json(alunos)
    })

    turmas.delete('/:id', async (req, res) => {
        const { id } = req.params

        if (mongoose.isValidObjectId(id)) {
            const turma = await turmasModels.findById(id)
            if (turma) {
                turma.deleteOne()
                res.json({deleted: true})
            } else {
                res.json({exists: false})
            }
        } else {
            res.json({exists: false})
        }
    })
// Exportações
    module.exports = turmas 