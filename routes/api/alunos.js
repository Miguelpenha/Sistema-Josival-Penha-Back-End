// Importações
    const express = require('express')
    const alunos = express.Router()
    const mongoose = require('mongoose')
    const multer = require('multer')
    const fs = require('fs')
    const path = require('path')
    const data = require('../../utils/data')
    // Configs
        const configMulter = require('../../config/multer/multer')
    // Models
        const alunosModels = require('../../models/aluno')
        const professorasModels = require('../../models/professora')
        const turmasModels = require('../../models/turma')
// Confi
    // Multer
        const fotoUpload = multer(configMulter.foto)
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

    alunos.post('/', fotoUpload.single('foto'), async (req, res) => {
        const { nome, sexo, nascimento, cpf, responsável1, responsável2, telefone, email, cep, cidade, bairro, rua, número, complemento, matrícula, turma, situação, observação, criação } = req.body

        const aluno = await alunosModels.findOne({nome: String(nome)})
        if (aluno) {
            res.json({error: 'Já existe um aluno cadastrado com esse nome'})
        } else {
            const professora = (await professorasModels.findOne({nome: (await turmasModels.findOne({nome: turma})).professora}))._id
            let foto = {}
            if (req.file) {
                const { originalname: nomeArq, mimetype: tipo, key, size: tamanho, location: url=undefined } = req.file
                foto = {
                    nome: nomeArq,
                    key,
                    tamanho,
                    tipo,
                    url
                }
            } else {
                foto = {
                    nome: 'Padrão.jpg',
                    key: 'Padrão.jpg',
                    tamanho: Number(fs.statSync(path.resolve(__dirname, '..', '..', 'public', 'Padrão.jpg')).size),
                    tipo: 'image/jpeg',
                    url: `${process.env.DOMINIO}/public/Padrão.jpg`
                }
            }
            
            alunosModels.create({
                nome,
                sexo,
                nascimento,
                cpf,
                responsável1,
                responsável2,
                telefone,
                email,
                endereço: {
                    cep,
                    número,
                    complemento,
                    bairro,
                    cidade,
                    rua
                },
                matrícula,
                turma: (await turmasModels.findOne({nome: turma}))._id,
                professora,
                situação,
                observação,
                foto,
                criação: {
                    data: new Date(criação).toLocaleDateString(),
                    hora: new Date(criação).toLocaleTimeString().split(':')[0]+':'+new Date(criação).toLocaleTimeString().split(':')[1],
                    sistema: new Date(criação).toISOString()
                }
            }).then(() => {
                res.json({created: true})
            })
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