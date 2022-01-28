const express = require('express')
const turmas = express.Router()
const mongoose = require('mongoose')
const turmasModels = require('../../models/turma')
const professorasModels = require('../../models/professora')
const alunosModels = require('../../models/aluno')

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
    const { nome, serie, turno, professora: nameProfessora, criação } = req.body

    const turma = await turmasModels.findOne({nome})
    
    if (turma) {
        res.json({error: 'Já existe uma turma com esse nome'})
    } else {
        const professora = await professorasModels.findOne({nome: nameProfessora})

        if (professora) {
            turmasModels.create({
                nome,
                serie,
                turno,
                professora: professora.nome,
                criacao: {
                    data: new Date(criação).toLocaleDateString(),
                    hora: new Date(criação).toLocaleTimeString().split(':')[0]+':'+new Date(criação).toLocaleTimeString().split(':')[1],
                    sistema: new Date(criação).toISOString()
                }
            }).then(async () => {
                professora.turmas = professora.turmas+1
                professora.save()
                .then(() => res.json({created: true}))
                .catch(() => res.status(400).json({error: 'Houve um erro ao ligar essa turma a professora'}))
            }).catch(() => res.status(400).json({error: 'Houve um erro ao criar a turma'}))
        } else {
            res.status(400).json({error: 'Não existe uma professora com esse nome'})
        }
    }
})

turmas.get('/alunos/:id', async (req, res) => {
    const alunosBrutos = await alunosModels.find({turma: req.params.id})

    const alunos = await Promise.all(
        alunosBrutos.map(async aluno => {
            aluno.turma = (await turmasModels.findById(aluno.turma)).nome
            aluno.professora = (await professorasModels.findById(aluno.professora)).nome

            return aluno
        })
    )

    res.json(alunos)
})

turmas.delete('/:id', async (req, res) => {
    const { id } = req.params

    if (mongoose.isValidObjectId(id)) {
        const turma = await turmasModels.findById(id)
        
        if (turma) {
            turma.deleteOne()
            const alunosDelete = await alunosModels.find({turma: id})

            alunosDelete.map(aluno => aluno.deleteOne())

            const professoraEdit = await professorasModels.findOne({nome: turma.professora})

            professoraEdit.turmas = professoraEdit.turmas-1
            professoraEdit.save()

            res.json({deleted: true})
        } else {
            res.json({exists: false})
        }
    } else {
        res.json({exists: false})
    }
})

module.exports = turmas 