const express = require('express')
const documents = express.Router()
const path = require('path')
const PDFDOCUMENT = require('pdfkit')
const data = require('../../../utils/data')
const mongoose = require('mongoose')
const alunosModels = require('../../../models/aluno')
const turmasModels = require('../../../models/turma')
const excelJs = require('exceljs')
const crypto = require('crypto')
const fs = require('fs')
const namesMatters = require('../../../namesMatters.json')
const dinero = require('dinero.js')

dinero.globalLocale = 'pt-br'

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

documents.post('/declaration-finance', async (req, res) => {
    const { id, ano } = req.body

    if (mongoose.isValidObjectId(id)) {
        const aluno = await alunosModels.findById(id)

        if (aluno) {
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

            let totalMensalidades = 0

            Object.keys(aluno.pagamentos).map(mês => totalMensalidades+=aluno.pagamentos[mês].valueBruto)
            
            totalMensalidades = dinero({ amount: totalMensalidades, currency: 'BRL' }).toFormat()

            doc.name = `Declaração do aluno(a) ${aluno.nome}`
    
            doc.on('data', chunk => chunks.push(chunk))

            doc
            .opacity(0.15)
            .image(path.resolve(__dirname, '..', '..', '..', 'public', 'logo-josival-penha.png'), 150, 300, {
                width: 300
            })
            .opacity(1)
            .image(path.resolve(__dirname, '..', '..', '..', 'public', 'logo-josival-penha.png'), 250, 50, {
                width: 90
            })
            .font('Helvetica-Bold')
            .moveDown(6.5)
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
                align: 'center',
                underline: true
            })
            .font('Helvetica')
            .fontSize(13)
            .moveDown(3)
            .text(`Paulista, ${new Date().getDate()} de ${data.getMes(new Date().toLocaleDateString('pt-br').split('/')[1])} de ${new Date().       getFullYear()}`, {
                align: 'right',
                underline: false
            })
            .moveDown(2)
            .text('Declaro que o aluno(a) ', {
                continued: true,
                align: 'justify'
            })
            .font('Helvetica-Bold')
            .text(aluno.nome, {
                continued: true,
                align: 'left',
                underline: true
            })
            .font('Helvetica')
            .text(' Cursou o ', {
                continued: true,
                align: 'justify',
                underline: false
            })
            .font('Helvetica-Bold')
            .text(`${anoLetivo} - em ${ano}`, {
                continued: true,
                align: 'left',
                underline: true
            })
            .font('Helvetica')
            .text(' nesta entidade de ensino.', {
                align: 'left',
                underline: false
            })
            .text('Srª ', {
                continued: true
            })
            .font('Helvetica-Bold')
            .text(aluno.responsável1, {
                continued: true,
                align: 'left',
                underline: true
            })
            .font('Helvetica')
            .text(', CPF nº ', {
                continued: true,
                underline: false
            })
            .font('Helvetica-Bold')
            .text(aluno.cpf, {
                continued: true,
                align: 'left',
                underline: true
            })
            .font('Helvetica')
            .text(' pai e responsável financeiro pelo aluno(a).', {
                align: 'left',
                underline: false
            })
            .text(`Está adimplente com as mensalidades escolares no ano de ${ano}.`)
            .text('Nos seguintes meses:')
            .text(`Matrícula.................................................${aluno.pagamentos['01'].value.replace('R$ ', '')}`)
            .text(`Fevereiro.................................................${aluno.pagamentos['02'].value.replace('R$ ', '')}`)
            .text(`Março......................................................${aluno.pagamentos['03'].value.replace('R$ ', '')}`)
            .text(`Abril.........................................................${aluno.pagamentos['04'].value.replace('R$ ', '')}`)
            .text(`Maio.........................................................${aluno.pagamentos['05'].value.replace('R$ ', '')}`)
            .text(`Junho.......................................................${aluno.pagamentos['06'].value.replace('R$ ', '')}`)
            .text(`Julho........................................................${aluno.pagamentos['07'].value.replace('R$ ', '')}`)
            .text(`Agosto......................................................${aluno.pagamentos['08'].value.replace('R$ ', '')}`)
            .text(`Setembro.................................................${aluno.pagamentos['09'].value.replace('R$ ', '')}`)
            .text(`Outubro....................................................${aluno.pagamentos['10'].value.replace('R$ ', '')}`)
            .text(`Novembro.................................................${aluno.pagamentos['11'].value.replace('R$ ', '')}`)
            .text(`Dezembro.................................................${aluno.pagamentos['12'].value.replace('R$ ', '')}`)
            .moveDown(0.5)
            .text(`Total.......................................................${totalMensalidades.replace('R$ ', '')}`)
            .moveDown(2.2)
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
            res.status('400').json({error: 'Esse aluno(a) não existe'})
        }
    } else {
        res.status('400').json({error: 'Id inválido'})
    }
})

documents.post('/report', async (req, res) => {
    const { id } = req.body
    const aluno = await alunosModels.findById(id)

    if (aluno) {
        const planilha = new excelJs.Workbook()
        const pagina = planilha.addWorksheet(`Boletim de ${aluno.nome}`)

        pagina.columns = [
            {
                header: 'Matérias', 
                key: 'matérias', 
                width: 15
            },
            {
                header: '1° unidade', 
                key: '1unidade', 
                width: 12,
                style: { alignment: { horizontal: 'center' } }
            },
            {
                header: '2° unidade', 
                key: '2unidade', 
                width: 12,
                style: { alignment: { horizontal: 'center' } }
            },
            {
                header: '3° unidade', 
                key: '3unidade', 
                width: 12,
                style: { alignment: { horizontal: 'center' } }
            },
            {
                header: '4° unidade', 
                key: '4unidade', 
                width: 12,
                style: { alignment: { horizontal: 'center' } }
            }
        ]

        namesMatters.map(matter => 
            pagina.addRow([
                matter.displayName,
                aluno.matérias[matter.name].primeira,
                aluno.matérias[matter.name].segunda,
                aluno.matérias[matter.name].terceira,
                aluno.matérias[matter.name].quarta
            ])
        )

        namesMatters.map((matter, index) => {
            pagina.findCell('A'+Number(index+1)).font = { bold: true }
            pagina.findCell('A'+Number(index+1)).border = {
                top: { color: '#000000', style: 'thin' },
                right: { color: '#000000', style: 'thin' },
                left: { color: '#000000', style: 'thin' },
                bottom: { color: '#000000', style: 'thin' }
            }
            pagina.findCell('B'+Number(index+1)).font = { bold: true }
            pagina.findCell('B'+Number(index+1)).border = {
                top: { color: '#000000', style: 'thin' },
                right: { color: '#000000', style: 'thin' },
                left: { color: '#000000', style: 'thin' },
                bottom: { color: '#000000', style: 'thin' }
            }
            pagina.findCell('C'+Number(index+1)).font = { bold: true }
            pagina.findCell('C'+Number(index+1)).border = {
                top: { color: '#000000', style: 'thin' },
                right: { color: '#000000', style: 'thin' },
                left: { color: '#000000', style: 'thin' },
                bottom: { color: '#000000', style: 'thin' }
            }
            pagina.findCell('D'+Number(index+1)).font = { bold: true }
            pagina.findCell('D'+Number(index+1)).border = {
                top: { color: '#000000', style: 'thin' },
                right: { color: '#000000', style: 'thin' },
                left: { color: '#000000', style: 'thin' },
                bottom: { color: '#000000', style: 'thin' }
            }
            pagina.findCell('E'+Number(index+1)).font = { bold: true }
            pagina.findCell('E'+Number(index+1)).border = {
                top: { color: '#000000', style: 'thin' },
                right: { color: '#000000', style: 'thin' },
                left: { color: '#000000', style: 'thin' },
                bottom: { color: '#000000', style: 'thin' }
            }
        })
        pagina.findCell('A'+Number(namesMatters.length+1)).font = { bold: true }
        pagina.findCell('A'+Number(namesMatters.length+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('A1').font = { bold: true }
        pagina.findCell('A1').border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('B1').font = { bold: true }
        pagina.findCell('B1').border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('C1').font = { bold: true }
        pagina.findCell('C1').border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('D1').font = { bold: true }
        pagina.findCell('D1').border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('E1').font = { bold: true }
        pagina.findCell('E1').border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('B10').font = { bold: true }
        pagina.findCell('B10').border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('C10').font = { bold: true }
        pagina.findCell('C10').border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('D10').font = { bold: true }
        pagina.findCell('D10').border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('E10').font = { bold: true }
        pagina.findCell('E10').border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        
        const caminhoPlanilha = path.resolve(__dirname, '..', '..', '..', 'public', 'planilhas', `${crypto.randomBytes(4).toString('hex')}-alunos.xlsx`)

        await planilha.xlsx.writeFile(caminhoPlanilha)
        const tamanho = fs.statSync(caminhoPlanilha)

        res.setHeader('Content-Description', 'File Transfer')
        res.setHeader('Content-Disposition', 'attachment; filename=alunos.xlsx')
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        res.setHeader('Content-Length', tamanho.size)
        res.setHeader('Content-Transfer-Encoding', 'binary')
        res.setHeader('Cache-Control', 'must-revalidate')
        res.setHeader('Pragma', 'public')
        
        res.download(caminhoPlanilha, `Boletim de ${aluno.nome}.xlsx`, () => fs.unlinkSync(caminhoPlanilha))
    } else {
        res.json({ exists: false })
    }
})

module.exports = documents