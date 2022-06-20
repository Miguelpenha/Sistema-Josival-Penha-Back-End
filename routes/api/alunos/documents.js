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
const meses = require('../../../meses')

dinero.globalLocale = 'pt-br'

documents.post('/declaration', async (req, res) => {
    const { id, frequência } = req.body
    let { bolsista } = req.body

    if (mongoose.isValidObjectId(id)) {
        const aluno = await alunosModels.findById(id)
        const anoLetivo = (await turmasModels.findById(aluno.turma)).serie

        const doc = new PDFDOCUMENT({size: 'A4', margin: 60, lang: 'pt-br', displayTitle: `Declaração de frequência do aluno(a) ${aluno.nome}`, info: {
            Title: `Declaração de frequência do aluno(a) ${aluno.nome}`,
            CreationDate: new Date(),
            Author: 'Sistema Josival Penha',
            Creator: 'Sistema Josival Penha',
            ModDate: new Date(),
            Producer: 'Sistema Josival Penha'
        }})

        const chunks = []

        doc.name = `Declaração de frequência do aluno(a) ${aluno.nome}`

        doc.on('data', chunks.push.bind(chunks))

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
        .text(`, matriculado neste estabelecimento de Ensino no ${anoLetivo} do Ensino Fundamental.`, {
            align: 'left'
        })
        .moveDown(1.5)
        
        if (bolsista || bolsista === 'true') {
            doc
            .text(`Aluno(a) bolsista`)
            .moveDown(0.5)
        }

        doc
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

        doc.on('end', () => {
            res
            .contentType('application/pdf')
            .setHeader('Content-disposition', `attachment; filename=Declaração de frequência do aluno(a) ${aluno.nome}.pdf`)
            .setHeader('Content-Length', Buffer.byteLength(Buffer.concat(chunks)))
            .end(Buffer.concat(chunks))
        })

        doc.end()
    } else {
        res.status('400').json({error: 'Id inválido'})
    }
})

documents.post('/declaration-finance', async (req, res) => {
    const { id, ano } = req.body
    let { mátricula, mensalidade, mensalidades, responsável, cpf, noCpf } = req.body

    if (mongoose.isValidObjectId(id)) {
        const aluno = await alunosModels.findById(id)

        if (aluno) {
            const anoLetivo = (await turmasModels.findById(aluno.turma)).serie

            mátricula.includes(',') ? null : mátricula = `${mátricula},00`
            let mátriculaBruta = Number(
                mátricula.replace('.', '')
                .replace(',', '')
                .replace('R$', '')
                .trimStart()
            )

            let mensalidadeBruta = 0

            if (mensalidade) {
                mensalidade.includes(',') ? null : mensalidade = `${mensalidade},00`
                mensalidadeBruta = Number(
                    mensalidade.replace('.', '')
                    .replace(',', '')
                    .replace('R$', '')
                    .trimStart()
                )
            }

            let mensalidadesTotal = 0

            if (mensalidades) {
                Object.keys(mensalidades).map(mês => {
                    mensalidades[mês].includes(',') ? null : mensalidades[mês] = `${mensalidades[mês]},00`
                    mensalidades[mês] = Number(
                        mensalidades[mês].replace('.', '')
                        .replace(',', '')
                        .replace('R$', '')
                        .trimStart()
                    )

                    mensalidadesTotal += mensalidades[mês]
                })
            }
    
            const doc = new PDFDOCUMENT({size: 'A4', margins: {
                top: 60,
                left: 60,
                right: 60,
                bottom: 40
            }, lang: 'pt-br', displayTitle: `Declaração financeira do aluno(a) ${aluno.nome}`, info: {
                Title: `Declaração financeira do aluno(a) ${aluno.nome}`,
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

            doc.name = `Declaração financeira do aluno(a) ${aluno.nome}`
    
            doc.on('data', chunks.push.bind(chunks))

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
            .moveDown(1)
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
            .text(responsável === '1' ? aluno.responsável1 : aluno.responsável2, {
                continued: true,
                align: 'left',
                underline: true
            })
            .font('Helvetica')
            
            if (!noCpf) {
                doc.text(', CPF nº ', {
                    continued: true,
                    underline: false
                })
                .font('Helvetica-Bold')
                .text(`${cpf ? cpf : aluno.cpf}`, {
                    continued: true,
                    align: 'left',
                    underline: true
                })
                .text(' ', {
                    continued: true,
                    underline: false
                })
            } else {
                doc.text(', ', {
                    continued: true,
                    underline: false
                })
            }

            doc
            .font('Helvetica')
            .text('responsável financeiro pelo aluno(a).', {
                align: 'left',
                underline: false
            })
            .text(`Está adimplente com as mensalidades escolares no ano de ${ano}.`)
            .text('Nos seguintes meses:')
            .text(`Matrícula.................................................${dinero({ amount: mátriculaBruta, currency: 'BRL' }).toFormat()}`)
            .text(`Fevereiro.................................................${mensalidade ? dinero({ amount: mensalidadeBruta, currency: 'BRL' }).toFormat() : dinero({ amount: mensalidades['02'], currency: 'BRL' }).toFormat()}`)
            .text(`Março......................................................${mensalidade ? dinero({ amount: mensalidadeBruta, currency: 'BRL' }).toFormat() : dinero({ amount: mensalidades['03'], currency: 'BRL' }).toFormat()}`)
            .text(`Abril.........................................................${mensalidade ? dinero({ amount: mensalidadeBruta, currency: 'BRL' }).toFormat() : dinero({ amount: mensalidades['04'], currency: 'BRL' }).toFormat()}`)
            .text(`Maio.........................................................${mensalidade ? dinero({ amount: mensalidadeBruta, currency: 'BRL' }).toFormat() : dinero({ amount: mensalidades['05'], currency: 'BRL' }).toFormat()}`)
            .text(`Junho.......................................................${mensalidade ? dinero({ amount: mensalidadeBruta, currency: 'BRL' }).toFormat() : dinero({ amount: mensalidades['06'], currency: 'BRL' }).toFormat()}`)
            .text(`Julho........................................................${mensalidade ? dinero({ amount: mensalidadeBruta, currency: 'BRL' }).toFormat() : dinero({ amount: mensalidades['07'], currency: 'BRL' }).toFormat()}`)
            .text(`Agosto......................................................${mensalidade ? dinero({ amount: mensalidadeBruta, currency: 'BRL' }).toFormat() : dinero({ amount: mensalidades['08'], currency: 'BRL' }).toFormat()}`)
            .text(`Setembro.................................................${mensalidade ? dinero({ amount: mensalidadeBruta, currency: 'BRL' }).toFormat() : dinero({ amount: mensalidades['09'], currency: 'BRL' }).toFormat()}`)
            .text(`Outubro....................................................${mensalidade ? dinero({ amount: mensalidadeBruta, currency: 'BRL' }).toFormat() : dinero({ amount: mensalidades['10'], currency: 'BRL' }).toFormat()}`)
            .text(`Novembro.................................................${mensalidade ? dinero({ amount: mensalidadeBruta, currency: 'BRL' }).toFormat() : dinero({ amount: mensalidades['11'], currency: 'BRL' }).toFormat()}`)
            .text(`Dezembro.................................................${mensalidade ? dinero({ amount: mensalidadeBruta, currency: 'BRL' }).toFormat() : dinero({ amount: mensalidades['12'], currency: 'BRL' }).toFormat()}`)
            .moveDown(0.5)
            .text(`Total.......................................................${mensalidade ? dinero({ amount: (mensalidadeBruta*12)+mátriculaBruta, currency: 'BRL' }).toFormat() : dinero({ amount: mensalidadesTotal+mátriculaBruta, currency: 'BRL' }).toFormat()}`)
            .moveDown(2.5)
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
            .text('tel. (81) 3437-2618', 100, 772)
            .text('Av. João Paulo II, 894', 240, 771)
            .text('www.josivalpenha.com', 385, 770)
            .text('cel. (81) 99499-7501', 100, 788)
            .text('Mirueira, Paulista - PE', 240, 787)
            .text('@josival.penha', 385, 786)
    
            doc.on('end', () => {
                res
                .contentType('application/pdf')
                .setHeader('Content-disposition', `attachment; filename=Declaração financeira do aluno(a) ${aluno.nome}.pdf`)
                .setHeader('Content-Length', Buffer.byteLength(Buffer.concat(chunks)))
                .end(Buffer.concat(chunks))
            })

            doc.end()
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

documents.post('/payments', async (req, res) => {
    const planilha = new excelJs.Workbook()
    const pagina = planilha.addWorksheet('Pagamentos dos alunos')

    planilha.title = 'Pagamentos dos alunos'
    planilha.creator = 'Josival Penha'

    let columns = [
        {
            header: 'Índice',
            key: 'índice',
            width: 8,
            style: {
                font: {
                    bold: true
                }
            }
        },
        {
            header: 'Aluno',
            key: 'Aluno',
            width: 32,
            style: {
                alignment: {
                    horizontal: 'center'
                },
                font: {
                    bold: true
                }
            }
        }
    ]
    
    meses.map(mês => (
        columns.push({
            header: mês,
            key: mês,
            width: 14
        })
    ))

    pagina.columns = columns

    pagina.findCell('A1').border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('B1').font = {
        bold: true
    }
    pagina.findCell('B1').border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('C1').font = {
        bold: true
    }
    pagina.findCell('C1').border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('D1').font = {
        bold: true
    }
    pagina.findCell('D1').border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('E1').font = {
        bold: true
    }
    pagina.findCell('E1').border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('F1').font = {
        bold: true
    }
    pagina.findCell('F1').border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('G1').font = {
        bold: true
    }
    pagina.findCell('G1').border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('H1').font = {
        bold: true
    }
    pagina.findCell('H1').border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('I1').font = {
        bold: true
    }
    pagina.findCell('I1').border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('J1').font = {
        bold: true
    }
    pagina.findCell('J1').border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('K1').font = {
        bold: true
    }
    pagina.findCell('K1').border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('L1').font = {
        bold: true
    }
    pagina.findCell('L1').border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('M1').font = {
        bold: true
    }
    pagina.findCell('M1').border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('N1').font = {
        bold: true
    }
    pagina.findCell('N1').border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    
    const alunos = await alunosModels.find({})

    alunos.map((aluno, index) => {
        pagina.addRow([
            index+1,
            aluno.nome,
            aluno.pagamentos['01'].pago ? aluno.pagamentos['01'].value : '',
            aluno.pagamentos['02'].pago ? aluno.pagamentos['02'].value : '',
            aluno.pagamentos['03'].pago ? aluno.pagamentos['03'].value : '',
            aluno.pagamentos['04'].pago ? aluno.pagamentos['04'].value : '',
            aluno.pagamentos['05'].pago ? aluno.pagamentos['05'].value : '',
            aluno.pagamentos['06'].pago ? aluno.pagamentos['06'].value : '',
            aluno.pagamentos['07'].pago ? aluno.pagamentos['07'].value : '',
            aluno.pagamentos['08'].pago ? aluno.pagamentos['08'].value : '',
            aluno.pagamentos['09'].pago ? aluno.pagamentos['09'].value : '',
            aluno.pagamentos['10'].pago ? aluno.pagamentos['10'].value : '',
            aluno.pagamentos['11'].pago ? aluno.pagamentos['11'].value : '',
            aluno.pagamentos['12'].pago ? aluno.pagamentos['12'].value : '',
        ])

        pagina.findCell('A'+Number(index+1)).alignment = {
            horizontal: 'left'
        }
        pagina.findCell('A'+Number(index+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('B'+Number(index+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('C'+Number(index+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('D'+Number(index+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('E'+Number(index+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('F'+Number(index+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('G'+Number(index+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('H'+Number(index+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('I'+Number(index+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('J'+Number(index+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('K'+Number(index+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('L'+Number(index+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('M'+Number(index+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
        pagina.findCell('N'+Number(index+1)).border = {
            top: { color: '#000000', style: 'thin' },
            right: { color: '#000000', style: 'thin' },
            left: { color: '#000000', style: 'thin' },
            bottom: { color: '#000000', style: 'thin' }
        }
    })

    pagina.findCell('A'+Number(alunos.length+1)).alignment = {
        horizontal: 'left'
    }
    pagina.findCell('A'+Number(alunos.length+1)).border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('B'+Number(alunos.length+1)).border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('C'+Number(alunos.length+1)).border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('D'+Number(alunos.length+1)).border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('E'+Number(alunos.length+1)).border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('F'+Number(alunos.length+1)).border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('G'+Number(alunos.length+1)).border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('H'+Number(alunos.length+1)).border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('I'+Number(alunos.length+1)).border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('J'+Number(alunos.length+1)).border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('K'+Number(alunos.length+1)).border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('L'+Number(alunos.length+1)).border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }
    pagina.findCell('M'+Number(alunos.length+1)).border = {
        top: { color: '#000000', style: 'thin' },
        right: { color: '#000000', style: 'thin' },
        left: { color: '#000000', style: 'thin' },
        bottom: { color: '#000000', style: 'thin' }
    }

    const chunks = await planilha.xlsx.writeBuffer()

    res.setHeader('Content-Description', 'File Transfer')
    .setHeader('Content-Disposition', 'attachment; filename=Pagamentos dos alunos.xlsx')
    .contentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    .setHeader('Content-Length', Buffer.byteLength(chunks))
    .setHeader('Content-Transfer-Encoding', 'binary')
    .setHeader('Cache-Control', 'must-revalidate')
    .setHeader('Pragma', 'public')
    .end(chunks)
})

documents.post('/notification', async (req, res) => {
    const { text } = req.body
    const chunks = []

    const doc = new PDFDOCUMENT({size: 'A4', margins: {
        top: 60,
        left: 60,
        right: 60,
        bottom: 40
    }, lang: 'pt-br', displayTitle: 'Aviso', info: {
        Title: 'Aviso',
        CreationDate: new Date(),
        Author: 'Sistema Josival Penha',
        Creator: 'Sistema Josival Penha',
        ModDate: new Date(),
        Producer: 'Sistema Josival Penha'
    }})

    doc.name = 'Aviso'
    
    doc.on('data', chunks.push.bind(chunks))
    doc.registerFont('Quicksand-Bold', path.resolve(__dirname, '..', '..', '..', 'public', 'fonts', 'quicksand', 'Quicksand-Bold.ttf'))
    doc.registerFont('Quicksand', path.resolve(__dirname, '..', '..', '..', 'public', 'fonts', 'quicksand', 'Quicksand-Regular.ttf'))

    doc
    .rect(5, 5, 285, 400)
    .lineWidth(6)
    .stroke('#ed3237')
    .fill('#ffffff')
    .image(path.resolve(__dirname, '..', '..', '..', 'public', 'icon-aviso.png'), 120, 20, {
        scale: 0.050
    })
    .fill('#0872fc')
    .font('Quicksand-Bold')
    .fontSize(28)
    .fillColor('#0872fc')
    .moveDown(0.2)
    .text('Comunicado', 55)
    .fillColor('#ff5757')
    .text('Escolar', 90)
    .moveDown(0.5)
    .font('Quicksand')
    .fontSize(14)
    .fillColor('#000000')
    .text(text, 25, 160, {
        width: 250
    })
    .fontSize(12)
    .font('Quicksand-Bold')
    .text('Atenciosamente, ', 25, 345)
    .text('Instituto Educacional Josival Penha', 25, 365)
    .image(path.resolve(__dirname, '..', '..', '..', 'public', 'logo-JP-aviso.png'), 250, 365, {
        scale: 0.050
    })

    doc
    .rect(305, 5, 285, 400)
    .lineWidth(6)
    .stroke('#ed3237')
    .fill('#ffffff')
    .image(path.resolve(__dirname, '..', '..', '..', 'public', 'icon-aviso.png'), 430, 20, {
        scale: 0.050
    })
    .fill('#0872fc')
    .font('Quicksand-Bold')
    .fontSize(28)
    .fillColor('#0872fc')
    .moveDown(0.2)
    .text('Comunicado', 365, 70)
    .fillColor('#ff5757')
    .text('Escolar', 400)
    .moveDown(0.5)
    .font('Quicksand')
    .fontSize(14)
    .fillColor('#000000')
    .text(text, 325, 160, {
        width: 250
    })
    .fontSize(12)
    .font('Quicksand-Bold')
    .text('Atenciosamente, ', 325, 345)
    .text('Instituto Educacional Josival Penha', 325, 365)
    .image(path.resolve(__dirname, '..', '..', '..', 'public', 'logo-JP-aviso.png'), 550, 365, {
        scale: 0.050
    })

    doc
    .rect(5, 425, 285, 400)
    .lineWidth(6)
    .stroke('#ed3237')
    .fill('#ffffff')
    .image(path.resolve(__dirname, '..', '..', '..', 'public', 'icon-aviso.png'), 120, 440, {
        scale: 0.050
    })
    .fill('#0872fc')
    .font('Quicksand-Bold')
    .fontSize(28)
    .fillColor('#0872fc')
    .moveDown(0.2)
    .text('Comunicado', 55, 490)
    .fillColor('#ff5757')
    .text('Escolar', 90)
    .moveDown(0.5)
    .font('Quicksand')
    .fontSize(14)
    .fillColor('#000000')
    .text(text, 25, 585, {
        width: 250
    })
    .fontSize(12)
    .font('Quicksand-Bold')
    .text('Atenciosamente, ', 25, 765)
    .text('Instituto Educacional Josival Penha', 25, 785)
    .image(path.resolve(__dirname, '..', '..', '..', 'public', 'logo-JP-aviso.png'), 250, 785, {
        scale: 0.050
    })

    doc
    .rect(305, 425, 285, 400)
    .lineWidth(6)
    .stroke('#ed3237')
    .fill('#ffffff')
    .image(path.resolve(__dirname, '..', '..', '..', 'public', 'icon-aviso.png'), 430, 440, {
        scale: 0.050
    })
    .fill('#0872fc')
    .font('Quicksand-Bold')
    .fontSize(28)
    .fillColor('#0872fc')
    .moveDown(0.2)
    .text('Comunicado', 365, 490)
    .fillColor('#ff5757')
    .text('Escolar', 400)
    .moveDown(0.5)
    .font('Quicksand')
    .fontSize(14)
    .fillColor('#000000')
    .text(text, 325, 585, {
        width: 250
    })
    .fontSize(12)
    .font('Quicksand-Bold')
    .text('Atenciosamente, ', 325, 765)
    .text('Instituto Educacional Josival Penha', 325, 785)
    .image(path.resolve(__dirname, '..', '..', '..', 'public', 'logo-JP-aviso.png'), 550, 785, {
        scale: 0.050
    })
    
    doc.on('end', () => {
        res
        .contentType('application/pdf')
        .setHeader('Content-disposition', 'attachment; filename=Aviso.pdf')
        .setHeader('Content-Length', Buffer.byteLength(Buffer.concat(chunks)))
        .end(Buffer.concat(chunks))
    })

    doc.end()
})

module.exports = documents