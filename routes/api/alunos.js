// Importações
    const express = require('express')
    const alunos = express.Router()
    const mongoose = require('mongoose')
    const multer = require('multer')
    const fs = require('fs')
    const path = require('path')
    const PDFDOCUMENT = require('pdfkit')
    const data = require('../../utils/data')
    const axios = require('axios').default
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

    alunos.post('/exportar', async (req, res) => {
        const { id, frequencia: frequência } = req.body
        const aluno = await alunosModels.findById(id)
        const anoLetivo = (await turmasModels.findById(aluno.turma)).serie

        const doc = new PDFDOCUMENT({size: 'A4', margin: 60, lang: 'pt-br', displayTitle: `Declaração do aluno(a) ${aluno.nome}`, info: {
            Title: `Declaração do aluno(a) ${aluno.nome}`,
            CreationDate: new Date(),
            Author: 'Sistema Josival Penha',
            Creator: 'Sistema Josival Penha',
            ModDate: new Date(),
            Producer: 'Sistema Josival Penha'
        }})

        const chunks = []

        doc.name = `Declaração do aluno(a) ${aluno.nome}`

        doc.on('data', chunk => chunks.push(chunk))

        doc
        .opacity(0.15)
        .image(path.resolve(__dirname, '..', '..', 'public', 'logo-josival-penha.png'), 150, 300, {
            width: 300
        })
        .opacity(1)
        .image(path.resolve(__dirname, '..', '..', 'public', 'logo-josival-penha.png'), 250, 79, {
            width: 90
        })
        .font('Helvetica-Bold')
        .moveDown(8.4)
        .text('Instituto Educacional Josival Penha', {
            align: 'center'
        })
        .font('Helvetica')
        .moveDown(0.4)
        .text('Cadastro Escolar nº P. 109.212 / INEP nº 26170981', {
            align: 'center'
        })
        .moveDown(0.4)
        .text('Portaria SEE nº 888 D.O 18/02/2003', {
            align: 'center'
        })
        .moveDown(0.4)
        .text('CNPJ: 11.654.198/0001-43', {
            align: 'center'
        })
        .fontSize(20)
        .moveDown(2)
        .font('Helvetica-Bold')
        .text('DECLARAÇÃO', {
            align: 'center'
        })
        .font('Helvetica')
        .fontSize(13)
        .moveDown(3)
        .text(`Paulista, ${new Date().getDate()} de ${data.getMes(new Date().toLocaleDateString('pt-br').split('/')[1])} de ${new Date().       getFullYear()}`, {
            align: 'right'
        })
        .moveDown(2)
        .text('Declaramos para os devidos fins que a aluno(a) ', {
            continued: true,
            align: 'justify'
        })
        .font('Helvetica-Bold')
        .text(aluno.nome, {
            continued: true,
            align: 'left'
        })
        .font('Helvetica')
        .text(', nascido em: ', {
            continued: true,
            align: 'justify'
        })
        .font('Helvetica-Bold')
        .text(aluno.nascimento, {
            continued: true,
            align: 'left'
        })
        .font('Helvetica')
        .text(', Número de Identificação Social (NIS): ', {
            continued: true,
            align: 'justify'
        })
        .font('Helvetica-Bold')
        .text('', {
            continued: true,
            align: 'justify'
        })
        .font('Helvetica')
        .text(', filho de ', {
            continued: true,
            align: 'justify'
        })
        .font('Helvetica-Bold')
        .text(aluno.responsável1, {
            continued: true,
            align: 'left'
        })
        .font('Helvetica')
        .text(' e ', {
            continued: true,
            align: 'justify'
        })
        .font('Helvetica-Bold')
        .text(aluno.responsável2, {
            continued: true,
            align: 'left'
        })
        .font('Helvetica')
        .text(`, matriculado neste estabelecimento de Ensino no ${anoLetivo} do Ensino Fundamental com bolsa de estudos.`, {
            align: 'justify'
        })
        .moveDown(1.5)
        .text(`Tem frequência de ${frequência}% dos dias letivos`)
        .moveDown(6.2)
        .fontSize(12)
        .text('__________________________________', {
            align: 'center'
        })
        .fontSize(14)
        .moveDown(0.4)
        .text('Diretora', {
            align: 'center'
        })
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('tel. (81) 3437-2618', 100, 752)
        .text('Av. João Paulo II, 894', 240, 751)
        .text('www.josivalpenha.com', 385, 750)
        .text('cel. (81) 99499-7501', 100, 768)
        .text('Mirueira, Paulista - PE', 240, 767)
        .text('@josival.penha', 385, 766)

        doc.end()

        doc.on('end', () => {
            res.setHeader('Content-disposition', `inline; filename=Declaração do aluno(a) ${aluno.nome}.pdf`)
            res.setHeader('Content-type', 'application/pdf')
            res.end(Buffer.concat(chunks))
        })
    })
// Exportações
    module.exports = alunos