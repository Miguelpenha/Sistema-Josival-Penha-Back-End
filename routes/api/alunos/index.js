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
        const { turma, filter, mes, atrazados } = req.body
        const alunosBrutos = turma ? await alunosModels.find({turma: turma}) : await alunosModels.find({})
        
        const alunos = await Promise.all(
            alunosBrutos.map(async aluno => {
                aluno.turma = (await turmasModels.findById(aluno.turma)).nome
                aluno.professora = (await professorasModels.findById(aluno.professora)).nome

                if (!filter || aluno.nome.toUpperCase().includes(filter.toUpperCase())) {
                    return aluno
                }
            })
        )
        
        res.json(alunos)
    }
})

alunos.get('/:id', async (req, res) => {
    const { id } = req.params
    
    if (mongoose.isValidObjectId(id)) {
        const aluno = await alunosModels.findById(id)

        if (aluno) {
            aluno.turma = (await turmasModels.findById(aluno.turma)).nome

            res.json(aluno)
        } else {
            res.json({exists: false})
        }
    } else {
        res.json({exists: false})
    }
})

alunos.post('/', fotoUpload.single('foto'), async (req, res) => {
    Object.keys(req.body).map(key => req.body[key] = req.body[key] ? req.body[key] : undefined)

    const { nome, sexo, nascimento, cpf, respons??vel1, respons??vel2, telefone, email, cep, cidade, bairro, rua, n??mero, complemento, matr??cula, turma, situa????o, observa????o, cria????o } = req.body
    
    const alunoVeri = await alunosModels.findOne({nome: String(nome)})

    if (alunoVeri) {
        res.json({error: 'J?? existe um aluno cadastrado com esse nome'})
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
                nome: 'Padr??o.jpg',
                key: 'Padr??o.jpg',
                tamanho: (Number(fs.statSync(path.resolve(__dirname, '..', '..', '..', 'public', 'Padr??o.jpg')).size)/(1024*1024)).toFixed(2),
                tipo: 'image/jpeg',
                url: `${process.env.DOMINIO}/public/Padr??o.jpg`,
                width: 500,
                height: 500
            }
        }

        const IdTurma = (await turmasModels.findOne({nome: turma}))._id

        const turmaModi = await turmasModels.findById(IdTurma).select('alunos')
        turmaModi.alunos = Number(turmaModi.alunos)+1
        await turmaModi.save()
        const valueMensalidade = dinero({ amount: Number(process.env.VALUE_MENSALIDADE.replace(',', '').replace('.', '')), currency: 'BRL' })
        const aluno = {
            nome,
            sexo,
            nascimento: nascimento === 'undefined/undefined/' ? undefined : nascimento,
            cpf,
            respons??vel1,
            respons??vel2,
            telefone,
            email,
            endere??o: {
                cep,
                n??mero,
                complemento,
                bairro,
                cidade,
                rua
            },
            matr??cula: matr??cula === 'undefined/undefined/' ? undefined : matr??cula,
            turma: IdTurma,
            professora,
            situa????o,
            observa????o,
            foto,
            cria????o: {
                data: new Date(cria????o).toLocaleDateString('pt-br'),
                hora: new Date(cria????o).toLocaleTimeString().split(':')[0]+':'+new Date(cria????o).toLocaleTimeString().split(':')[1],
                sistema: new Date(cria????o).toISOString()
            },
            mat??rias: {
                portugu??s: {
                    primeira: 0,
                    segunda: 0,
                    terceira: 0,
                    quarta: 0
                },
                ingl??s: {
                    primeira: 0,
                    segunda: 0,
                    terceira: 0,
                    quarta: 0
                },
                matem??tica: {
                    primeira: 0,
                    segunda: 0,
                    terceira: 0,
                    quarta: 0
                },
                hist??ria: {
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
                ci??ncias: {
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
                religi??o: {
                    primeira: 0,
                    segunda: 0,
                    terceira: 0,
                    quarta: 0
                },
                educa????oF??sica: {
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
                    vencimentoSistema: new Date(new Date().getFullYear(), 0, 10),
                    forma: 'Esp??cie'
                },
                '02': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/02/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 1, 10),
                    forma: 'Esp??cie'
                },
                '03': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/03/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 2, 10),
                    forma: 'Esp??cie'
                },
                '04': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/04/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 3, 10),
                    forma: 'Esp??cie'
                },
                '05': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/05/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 4, 10),
                    forma: 'Esp??cie'
                },
                '06': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/06/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 5, 10),
                    forma: 'Esp??cie'
                },
                '07': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/07/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 6, 10),
                    forma: 'Esp??cie'
                },
                '08': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/08/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 7, 10),
                    forma: 'Esp??cie'
                },
                '09': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/09/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 8, 10),
                    forma: 'Esp??cie'
                },
                '10': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/10/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 9, 10),
                    forma: 'Esp??cie'
                },
                '11': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/11/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 10, 10),
                    forma: 'Esp??cie'
                },
                '12': {
                    valueBruto: valueMensalidade.getAmount(),
                    value: valueMensalidade.toFormat(),
                    pago: false,
                    vencimento: `10/12/${new Date().getFullYear()}`,
                    vencimentoSistema: new Date(new Date().getFullYear(), 11, 10),
                    forma: 'Esp??cie'
                }
            }
        }
            
        alunosModels.create(aluno).then(() => res.json({created: true}))
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
            header: 'Respons??vel 1: ', 
            key: 'responsavel1', 
            width: 25
        },
        {
            header: 'Respons??vel 2: ', 
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
            header: 'N??mero da casa: ', 
            key: 'endereco.numero', 
            width: 25
        },
        {
            header: 'Complemento da casa: ', 
            key: 'endereco.complemento', 
            width: 25
        },
        {
            header: 'Data de matr??cula: ', 
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
            header: 'Situa????o: ', 
            key: 'situacao', 
            width: 10
        },
        {
            header: 'Observa????o: ', 
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
            aluno.respons??vel1 || '',
            aluno.respons??vel2 || '',
            aluno.telefone || '',
            aluno.email || '',
            aluno.endere??o.cep || '',
            aluno.endere??o.cidade || '',
            aluno.endere??o.bairro || '',
            aluno.endere??o.rua || '',
            aluno.endere??o.n??mero || '',
            aluno.endere??o.complemento || '',
            aluno.matr??cula || '',
            aluno.turma || '',
            aluno.professora || '',
            aluno.situa????o || '',
            aluno.observa????o || '',
            aluno.foto.url || '',
            `${aluno.cria????o.data} ??s ${aluno.cria????o.hora}`
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

alunos.post('/exportar-por-turma', async (req, res) => {
    const planilha = new excelJs.Workbook()
    const turmas = await turmasModels.find()
    const alunosBrutos = await alunosModels.find()
    const alunos = await Promise.all(
        alunosBrutos.map(async aluno => {
            aluno.turma = (await turmasModels.findById(aluno.turma)).nome
            aluno.professora = (await professorasModels.findById(aluno.professora)).nome

            return aluno
        })
    )

    planilha.title = 'Alunos'
    planilha.creator = 'Josival Penha'

    const columns = [
        {
            header: '??ndice:', 
            key: '??ndice', 
            width: 8
        },
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
            header: 'Respons??vel 1: ', 
            key: 'responsavel1', 
            width: 25
        },
        {
            header: 'Respons??vel 2: ', 
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
            header: 'N??mero da casa: ', 
            key: 'endereco.numero', 
            width: 25
        },
        {
            header: 'Complemento da casa: ', 
            key: 'endereco.complemento', 
            width: 25
        },
        {
            header: 'Data de matr??cula: ', 
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
            header: 'Situa????o: ', 
            key: 'situacao', 
            width: 10
        },
        {
            header: 'Observa????o: ', 
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

    turmas.map(turma => {
        const pagina = planilha.addWorksheet(turma.nome)
    
        pagina.columns = columns

        let cont = 1

        alunos.map((aluno, index) => {
            if (aluno.turma == turma.nome) {
                pagina.addRow([
                    cont,
                    aluno.nome || '',
                    aluno.sexo || '',
                    aluno.nascimento || '',
                    aluno.cpf || '',
                    aluno.respons??vel1 || '',
                    aluno.respons??vel2 || '',
                    aluno.telefone || '',
                    aluno.email || '',
                    aluno.endere??o.cep || '',
                    aluno.endere??o.cidade || '',
                    aluno.endere??o.bairro || '',
                    aluno.endere??o.rua || '',
                    aluno.endere??o.n??mero || '',
                    aluno.endere??o.complemento || '',
                    aluno.matr??cula || '',
                    aluno.turma || '',
                    aluno.professora || '',
                    aluno.situa????o || '',
                    aluno.observa????o || '',
                    aluno.foto.url || '',
                    `${aluno.cria????o.data} ??s ${aluno.cria????o.hora}`
                ])
                cont++
                try {
                    pagina.findCell('A'+(cont)).style = {
                        alignment: {
                            horizontal: 'center'
                        },
                        border: {
                            top: { color: '#000000', style: 'thin' },
                            right: { color: '#000000', style: 'thin' },
                            left: { color: '#000000', style: 'thin' },
                            bottom: { color: '#000000', style: 'thin' }
                        }
                    }
                    pagina.findCell('B'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('C'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('D'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('E'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('F'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('G'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('H'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('I'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('J'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('K'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('L'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('M'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('N'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('O'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('P'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('Q'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('R'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('S'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('T'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('U'+(cont)).value = {
                        text: aluno.foto.url,
                        hyperlink: aluno.foto.url,
                        tooltip: aluno.foto.url
                    }
                    pagina.findCell('U'+(cont)).style = {
                        font: {
                            underline: true,
                            color: { argb: 'FF0000FF' }
                        },
                        border: {
                            top: { color: '#000000', style: 'thin' },
                            right: { color: '#000000', style: 'thin' },
                            left: { color: '#000000', style: 'thin' },
                            bottom: { color: '#000000', style: 'thin' }
                        }
                    }
                    pagina.findCell('V'+(cont)).border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('A1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('B1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('C1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('D1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('E1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('F1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('G1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('H1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('I1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('J1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('K1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('L1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('M1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('N1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('O1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('P1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('Q1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('R1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('S1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('T1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('U1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                    pagina.findCell('V1').border = {
                        top: { color: '#000000', style: 'thin' },
                        right: { color: '#000000', style: 'thin' },
                        left: { color: '#000000', style: 'thin' },
                        bottom: { color: '#000000', style: 'thin' }
                    }
                } catch {
                    
                }
            }
        })
    })
    
    const chunks = await planilha.xlsx.writeBuffer()

    res.setHeader('Content-Description', 'File Transfer')
    .setHeader('Content-Disposition', 'attachment; filename=Alunos.xlsx')
    .contentType('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    .setHeader('Content-Length', Buffer.byteLength(chunks))
    .setHeader('Content-Transfer-Encoding', 'binary')
    .setHeader('Cache-Control', 'must-revalidate')
    .setHeader('Pragma', 'public')
    .end(chunks)
})

alunos.post('/:id', async (req, res) => {
    Object.keys(req.body).map(key => req.body[key] = req.body[key] ? req.body[key] : null)
    
    const { id } = req.params
    const aluno = await alunosModels.findById(id)
    
    if (aluno) {
        const {
            nome,
            sexo,
            nascimento,
            cpf,
            respons??vel1,
            respons??vel2,
            telefone,
            email,
            cep,
            cidade,
            bairro,
            rua,
            n??mero,
            complemento,
            matr??cula,
            turma,
            situa????o,
            observa????o
        } = req.body
        
        const alunoByName = await alunosModels.findOne({nome})

        if (aluno.nome === nome || !alunoByName) {
            const turmaModiNew = await turmasModels.findById(turma)

            if (turmaModiNew) {
                const turmaModiOriginal = await turmasModels.findById(aluno.turma)

                if (aluno.turma != turma) {
                    turmaModiNew.alunos = turmaModiNew.alunos+1

                    turmaModiNew.save()

                    turmaModiOriginal.alunos = turmaModiOriginal.alunos-1

                    turmaModiOriginal.save()
                }

                alunosModels.findByIdAndUpdate(id, {
                    nome,
                    sexo,
                    nascimento: nascimento === 'undefined/undefined/' ? undefined : nascimento,
                    cpf,
                    respons??vel1,
                    respons??vel2,
                    telefone,
                    email,
                    endere??o: {
                        cep,
                        n??mero,
                        complemento,
                        bairro,
                        cidade,
                        rua
                    },
                    matr??cula,
                    turma,
                    professora: (await professorasModels.findOne({nome: turmaModiNew.professora}))._id,
                    situa????o,
                    observa????o
                })
                .then(() => res.json({edited: true}))
                .catch(() => res.json({error: 'Houve um erro ao editar esse aluno'}))
            } else {
                res.json({error: 'Essa turma n??o existe'})
            }
        } else {
            res.json({error: 'J?? existe um aluno cadastrado com esse nome'})
        }
    } else {
        res.json({exists: false})
    }
})

alunos.delete('/', async (req, res) => {
    const alunos = await alunosModels.find({})

    alunos.map(aluno => {
        alunosModels.findByIdAndDelete(aluno._id, async () => {
            const turmaDelete = await turmasModels.findById(aluno.turma)

            turmaDelete.alunos = turmaDelete.alunos-1

            turmaDelete.save().then(() => {})
        })
    })

    res.json({deleted: true})
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
                if (aluno.foto.key != 'Padr??o.jpg') {
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

module.exports = alunos