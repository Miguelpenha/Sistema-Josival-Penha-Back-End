// Importações
    const express = require('express')
    const documents = express.Router()
    const path = require('path')
    const PDFDOCUMENT = require('pdfkit')
    const data = require('../../../utils/data')
    const mongoose = require('mongoose')
    // Models
        const alunosModels = require('../../../models/aluno')
        const turmasModels = require('../../../models/turma')
// Config
    
// Grupo de rotas

// Rotas solo
    documents.post('/declaration', async (req, res) => {
        const { id, frequencia: frequência } = req.body
        let { bolsista } = req.body

        if (mongoose.isValidObjectId(id)) {
            const aluno = await alunosModels.findById(id)
            const anoLetivo = (await turmasModels.findById(aluno.turma)).serie

            try {
                bolsista.length
                bolsista = true
            } catch {
                
            }

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
            if (bolsista) {
                bolsista = true
            }
            doc
            .opacity(0.15)
            .image(path.resolve(__dirname, '..', '..', '..', 'public', 'logo-josival-penha.png'), 150, 300, {
                width: 300
            })
            .opacity(1)
            .image(path.resolve(__dirname, '..', '..', '..', 'public', 'logo-josival-penha.png'), 250, 79, {
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
            .text(`, matriculado neste estabelecimento de Ensino no ${anoLetivo} do Ensino Fundamental${bolsista ? ' com bolsa de estudos.' : '.'}`, {
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
        } else {
            res.status('400').json({error: 'Id inválido'})
        }
    })
// Exportações
    module.exports = documents