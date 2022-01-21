const express = require('express')
const alunos = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const excelJs = require('exceljs')
const crypto = require('crypto')
const probe = require('probe-image-size')
const aws = require('aws-sdk')
const s3 = new aws.S3()
const configMulter = require('../../../config/multer/multer')
const alunosModels = require('../../../models/aluno')
const professorasModels = require('../../../models/professora')
const turmasModels = require('../../../models/turma')
const documentsRouter = require('./documents')
const fotosRouter = require('./fotos')
const mattersRouter = require('./matters')
const fotoUpload = multer(configMulter.foto)
const dinero = require('dinero.js')

alunos.use('/documents', documentsRouter)
alunos.use('/fotos', fotosRouter)
alunos.use('/matters', mattersRouter)

alunos.get('/', async (req, res) => {
    if (req.query.quant) {
        const alunos = await alunosModels.find({}).select('id')
        
        res.json({quant: alunos.length})
    } else {
        const alunosBrutos = await alunosModels.find({})

        const alunos = await Promise.all(
            alunosBrutos.map(async aluno => {
                aluno.turma = (await turmasModels.findById(aluno.turma)).nome
                aluno.professora = (await professorasModels.findById(aluno.professora)).nome

                return aluno
            })
        )

        res.json(alunos)
    }
})

alunos.post('/', fotoUpload.single('foto'), async (req, res) => {
    Object.keys(req.body).map(key => req.body[key] = req.body[key] ? req.body[key] : undefined)

    const { nome, sexo, nascimento, cpf, responsável1, responsável2, telefone, email, cep, cidade, bairro, rua, número, complemento, matrícula, turma, situação, observação, criação } = req.body
    
    const alunoVeri = await alunosModels.findOne({nome: String(nome)})

    if (alunoVeri) {
        res.json({error: 'Já existe um aluno cadastrado com esse nome'})
    } else {
        const professora = (await professorasModels.findOne({nome: (await turmasModels.findOne({nome: turma})).professora}))._id
        let foto = {}
        
        if (req.file) {
            const { originalname: nomeArq, mimetype: tipo, key, size: tamanho, location: url=undefined } = req.file
            const { width, height } = await probe(url)

            foto = {
                nome: nomeArq,
                key,
                tamanho: (tamanho/(1024*1024)).toFixed(2),
                tipo,
                url: url ? url : `${process.env.DOMINIO}/public/alunos/fotos/${key}`,
                width,
                height
            }
        } else {
            foto = {
                nome: 'Padrão.jpg',
                key: 'Padrão.jpg',
                tamanho: (Number(fs.statSync(path.resolve(__dirname, '..', '..', '..', 'public', 'Padrão.jpg')).size)/(1024*1024)).toFixed(2),
                tipo: 'image/jpeg',
                url: `${process.env.DOMINIO}/public/Padrão.jpg`,
                width: 500,
                height: 500
            }
        }

        const IdTurma = (await turmasModels.findOne({nome: turma}))._id

        const turmaModi = await turmasModels.findById(IdTurma).select('alunos')
        turmaModi.alunos = Number(turmaModi.alunos)+1
        turmaModi.save()
        const valueMensalidade = dinero({ amount: Number(process.env.VALUE_MENSALIDADE.replace(',', '').replace('.', '')), currency: 'BRL' })
        const aluno = {
            nome,
            sexo,
            nascimento: nascimento === 'undefined/undefined/' ? undefined : nascimento,
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
            matrícula: matrícula === 'undefined/undefined/' ? undefined : matrícula,
            turma: IdTurma,
            professora,
            situação,
            observação,
            foto,
            criação: {
                data: new Date(criação).toLocaleDateString(),
                hora: new Date(criação).toLocaleTimeString().split(':')[0]+':'+new Date(criação).toLocaleTimeString().split(':')[1],
                sistema: new Date(criação).toISOString()
            },
            matérias: {
                português: {
                    primeira: 0,
                    segunda: 0,
                    terceira: 0,
                    quarta: 0
                },
                inglês: {
                    primeira: 0,
                    segunda: 0,
                    terceira: 0,
                    quarta: 0
                },
                matemática: {
                    primeira: 0,
                    segunda: 0,
                    terceira: 0,
                    quarta: 0
                },
                história: {
                    primeira: 0,
                    segunda: 0,
                    terceira: 0,
                    quarta: 0
                },
                artes: {
                    primeira: 0,
                    segunda: 0,
                    terceira: 0,
                    quarta: 0
                },
                ciências: {
                    primeira: 0,
                    segunda: 0,
                    terceira: 0,
                    quarta: 0
                },
                geografia: {
                    primeira: 0,
                    segunda: 0,
                    terceira: 0,
                    quarta: 0
                },
                religião: {
                    primeira: 0,
                    segunda: 0,
                    terceira: 0,
                    quarta: 0
                },
                educaçãoFísica: {
                    primeira: 0,
                    segunda: 0,
                    terceira: 0,
                    quarta: 0
                }
            },
            pagamentos: {
                '01': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/01/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 0, 10)
                },
                '02': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/01/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 1, 10)
                },
                '03': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/03/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 2, 10)
                },
                '04': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/04/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 3, 10)
                },
                '05': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/05/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 4, 10)
                },
                '06': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/06/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 5, 10)
                },
                '07': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/07/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 6, 10)
                },
                '08': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/08/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 7, 10)
                },
                '09': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/09/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 8, 10)
                },
                '10': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/10/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 9, 10)
                },
                '11': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/11/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 10, 10)
                },
                '12': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/12/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 11, 10)
                }
            }
        }
            
        alunosModels.create(aluno).then(() => res.json({created: true}))
    }
})

alunos.delete('/:id', async (req, res) => {
    const { id } = req.params

    if (mongoose.isValidObjectId(id)) {
        const aluno = await alunosModels.findById(id)

        if (aluno) {
            aluno.deleteOne()
            const turma = await turmasModels.findById(aluno.turma)
            turma.alunos = turma.alunos-1
            turma.save()

            if (process.env.ARMAZENAMENTO === 's3') {
                s3.deleteObject({
                    Bucket: process.env.AWS_NAME_BUCKET,
                    Key: aluno.foto.key
                }, (err, data) => {
                    
                })
            } else {
                if (aluno.foto.key != 'Padrão.jpg') {
                    fs.unlinkSync(path.resolve(__dirname, '..', '..', '..', 'public', 'alunos', 'fotos', aluno.foto.key))
                }
            }
            
            res.json({deleted: true})
        } else {
            res.json({exists: false})
        }
    } else {
        res.json({exists: false})
    }
})

alunos.post('/exportar', async (req, res) => {
    const planilha = new excelJs.Workbook()
    const pagina = planilha.addWorksheet('Alunos')
    
    pagina.columns = [
        {
            header: 'Nome: ', 
            key: 'nome', 
            width: 25
        },
        {
            header: 'Sexo: ', 
            key: 'sexo', 
            width: 25
        },
        {
            header: 'Data de nascimento: ', 
            key: 'nascimento', 
            width: 25
        },
        {
            header: 'CPF: ', 
            key: 'cpf', 
            width: 25
        },
        {
            header: 'Responsável 1: ', 
            key: 'responsavel1', 
            width: 25
        },
        {
            header: 'Responsável 2: ', 
            key: 'responsavel2',
            width: 25
        },
        {
            header: 'Telefone: ', 
            key: 'telefone', 
            width: 25
        },
        {
            header: 'E-mail: ', 
            key: 'email', 
            width: 25
        },
        {
            header: 'CEP: ', 
            key: 'endereco.cep', 
            width: 25
        },
        {
            header: 'Cidade: ', 
            key: 'endereco.cidade', 
            width: 25
        },
        {
            header: 'Bairro: ', 
            key: 'endereco.bairro', 
            width: 25
        },
        {
            header: 'Rua: ', 
            key: 'endereco.rua', 
            width: 25
        },
        {
            header: 'Número da casa: ', 
            key: 'endereco.numero', 
            width: 25
        },
        {
            header: 'Complemento da casa: ', 
            key: 'endereco.complemento', 
            width: 25
        },
        {
            header: 'Data de matrícula: ', 
            key: 'matricula', 
            width: 25
        },
        {
            header: 'Turma: ', 
            key: 'turma', 
            width: 25
        },
        {
            header: 'Professora: ', 
            key: 'professora', 
            width: 25
        },
        {
            header: 'Situação: ', 
            key: 'situacao', 
            width: 10
        },
        {
            header: 'Observação: ', 
            key: 'observacao', 
            width: 25
        },
        {
            header: 'Foto: ', 
            key: 'foto.url', 
            width: 45
        },
        {
            header: 'Data de cadastro no sistema: ', 
            key: 'criacao.data:criacao.hora', 
            width: 25
        }
    ]
    
    const alunosBrutos = await alunosModels.find({})

    const alunos = await Promise.all(
        alunosBrutos.map(async aluno => {
            aluno.turma = (await turmasModels.findById(aluno.turma)).nome
            aluno.professora = (await professorasModels.findById(aluno.professora)).nome

            return aluno
        })
    )

    alunos.map((aluno, index) => {
        pagina.addRow([
            aluno.nome || '',
            aluno.sexo || '',
            aluno.nascimento || '',
            aluno.cpf || '',
            aluno.responsável1 || '',
            aluno.responsável2 || '',
            aluno.telefone || '',
            aluno.email || '',
            aluno.endereço.cep || '',
            aluno.endereço.cidade || '',
            aluno.endereço.bairro || '',
            aluno.endereço.rua || '',
            aluno.endereço.número || '',
            aluno.endereço.complemento || '',
            aluno.matrícula || '',
            aluno.turma || '',
            aluno.professora || '',
            aluno.situação || '',
            aluno.observação || '',
            aluno.foto.url || '',
            `${aluno.criação.data} ás ${aluno.criação.hora}`
        ])

        try {
            pagina.findCell('A'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('B'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('C'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('D'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('E'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('F'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('G'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('H'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('I'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('J'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('K'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('L'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('M'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('N'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('O'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('P'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('Q'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('R'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('S'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('T'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('T'+(index+2)).value = {
                text: aluno.foto.url,
                hyperlink: aluno.foto.url,
                tooltip: aluno.foto.url
            }
            pagina.findCell('U'+(index+2)).alignment = {horizontal: 'center'}
        } catch {

        }
    })
    
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
    
    res.download(caminhoPlanilha, 'alunos.xlsx', () => fs.unlinkSync(caminhoPlanilha))
})

module.exports = alunos