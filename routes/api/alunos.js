// Importações
    const express = require('express')
    const alunos = express.Router()
    const mongoose = require('mongoose')
    const multer = require('multer')
    const fs = require('fs')
    const path = require('path')
    const PDFPrinter = require('pdfmake')
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

    alunos.get('/exportar', async (req, res) => {
        const alunos = await alunosModels.find({})

        const fonts = {
            Helvetica: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique'
            }
        }

        const printer = new PDFPrinter(fonts)

        const body = []

        for await (let aluno of alunos) {
            const rows = new Array()

            rows.push(aluno.turma)
            rows.push(aluno.professora)
            rows.push(aluno.nome)
            rows.push(aluno.telefone)
            rows.push(aluno.email)

            body.push(rows)
        }
        
        const pdfDoc = printer.createPdfKitDocument({
            defaultStyle: { font: 'Helvetica' },
            content: [
                {
                    text: 'Instituto Educacional Josival Penha',
                    margin: [0, 80, 0, 5],
                    style: {
                        bold: true,
                        alignment: 'center',
                        fontSize: 11
                    }
                },
                {
                    text: 'Cadastro Escolar n° P. 109.212 / INEP n° 26170981',
                    margin: [0, 0, 0, 5],
                    style: {
                        alignment: 'center',
                        fontSize: 11
                    }
                },
                {
                    text: 'Portaria SEE n° 888 D.O 18/02/2003',
                    margin: [0, 0, 0, 5],
                    style: {
                        alignment: 'center',
                        fontSize: 11
                    }
                },
                {
                    text: 'CNPJ: 11.654.198/0001-43',
                    margin: [0, 0, 0, 5],
                    style: {
                        alignment: 'center',
                        fontSize: 11
                    }
                },
                {
                    text: 'DECLARAÇÃO',
                    margin: [0, 55, 0, 45],
                    style: {
                        bold: true,
                        alignment: 'center',
                        fontSize: 22
                    }
                },
                {
                    text: `Paulista, ${new Date().getDate()} de ${data.getMes(new Date().toLocaleDateString('pt-br').split('/')[1])} de ${new Date().getFullYear()}`,
                    margin: [0, 55, 0, 0],
                    style: {
                        alignment: 'right',
                        fontSize: 11
                    }
                },
                {
                    text: ``,
                    margin: [0, 0, 0, 0],
                    style: {
                        alignment: 'justify',
                        fontSize: 11
                    }
                }
            ]
        })

        const chunks = []

        pdfDoc.on('data', chunk => chunks.push(chunk))

        pdfDoc.end()

        pdfDoc.on('end', () => res.end(Buffer.concat(chunks)))
    })
// Exportações
    module.exports = alunos