// Importações
    const express = require('express')
    const alunos = express.Router()
    const path = require('path')
    const fs = require('fs')
    const excelJs = require('exceljs')
    const crypto = require('crypto')
    const multer = require('multer')
    // Úteis
        const data = require('../utils/data')
    // Configs
        const configMulter = require('../config/multer/multer')
    // Middlewares
        const veriMiddleware = require('../middlewares/middlewares')
    // Models
        const alunosModels = require('../models/aluno')
        const turmasModels = require('../models/turma')
// Config geral
    // Multer
        const fotoUpload = multer(configMulter.foto)
    // Middlewares
        //alunos.use(veriMiddleware.login)
        alunos.use(veriMiddleware.voltar)
// Rotas
    alunos.get('/', async (req, res) => {
        const alunos = await alunosModels.find({})
        alunos.map((aluno, index) => {
            if (alunos.length-1 == index) {
                aluno.ultimo = true
            }
            return aluno
        })
        res.render('aluno/alunos', {alunos: alunos, voltar: req.voltar})
    })

    alunos.get('/cadastrar', async (req, res) => {
        const turmas = await turmasModels.find({})
        if (turmas.length) {
            res.render('aluno/cadastrar', {turmas: turmas, voltar: req.voltar, dominio: process.env.DOMINIO, data: data.input()})
        } else {
            req.flash('erro_msg', 'Você precisa ter uma turma cadastrada primeiro para poder cadastrar um aluno')
            res.redirect('/')
        }
    })

    alunos.post('/cadastrar-veri', fotoUpload.single('foto'), async (req, res) => {
        const aluno = await alunosModels.findOne({nome: String(req.body.nome)})
        if (aluno) {
            req.flash('erro_msg', 'Já existe um aluno cadastrado com esse nome')
            res.redirect('/alunos/cadastrar')
        } else {
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
                    tamanho: Number(fs.statSync(path.resolve(__dirname, '..', 'public', 'Padrão.jpg')).size),
                    tipo: 'image/jpeg',
                    url: `${process.env.DOMINIO}/public/Padrão.jpg`
                }
            }
            const { nome, sexo, nascimento, cpf, responsavel1, responsavel2, telefone, email, cep, cidade, bairro, rua, numero, complemento, matricula, turma, situacao, observacao } = req.body
            alunosModels.create({
                nome: nome,
                sexo: sexo,
                nascimento: data.converter.inputParaData(nascimento),
                cpf: cpf,
                responsavel1: responsavel1,
                responsavel2: responsavel2,
                telefone: telefone,
                email: email,
                endereco: {
                    cep: cep,
                    numero: numero,
                    complemento: complemento,
                    bairro: bairro,
                    cidade: cidade,
                    rua: rua
                },
                matricula: data.converter.inputParaData(matricula),
                turma: turma,
                professora: (await turmasModels.findOne({nome: turma})).professora,
                situacao: situacao,
                observacao: observacao,
                foto: foto,
                criacao: {
                    data: data(),
                    hora: data.hora(),
                    sistema: data.completa()
                }
            }).then(() => {
                req.flash('sucesso_msg', 'Aluno cadastrado com sucesso')
                res.redirect('/alunos')
            })
        }
    })

    alunos.post('/excluir/:id', async (req, res) => {
        const aluno = await alunosModels.findById(req.params.id)
        aluno.deleteOne({_id: req.params.id}, (err) => {
            if (err) {
                req.flash('erro_msg', 'Houve um erro ao excluir o aluno')
                res.redirect('/alunos')
            } else {
                req.flash('sucesso_msg', 'Aluno excluido com sucesso')
                res.redirect('/alunos')
            }
        })
    })

    alunos.post('/excluir-todos/:ids', (req, res) => {
        const ids = req.params.ids.split(',')
        let erros = false
        ids.forEach(async id => {
            const aluno = await alunosModels.findById(id)
            aluno.deleteOne((err) => {
                if (err) {
                    erros = true
                }
            })
        })
        if (erros) {
            req.flash('erro_msg', 'Houve um erro ao excluir os alunos')
            res.redirect('/alunos')
        } else {
            req.flash('sucesso_msg', 'Alunos excluidos com sucesso!')
            res.redirect('/alunos')
        }
    })

    alunos.post('/editar/:id', async (req, res) => {
        const aluno = await alunosModels.findById(req.params.id)
        const turmasBrutas = await turmasModels.find({})
        const turmas = []
        turmasBrutas.forEach(turma => {
            turmas.push(turma.nome)
        })
        const turma = await turmasModels.findById(aluno.turma)
        turmas.splice(turmas.indexOf(turma.nome), 1)
        const sexos = ['Masculino', 'Feminino']
        sexos.splice(sexos.indexOf(aluno.sexo), 1)
        const situacoes = ['Ativo', 'Cancelado']
        situacoes.splice(situacoes.indexOf(aluno.situacao), 1)
        res.render('aluno/editar', {aluno: aluno, turmas: turmas, turma: turma.nome, sexos: sexos, situacoes: situacoes, nascimento: data.converter.dataParaInput(aluno.nascimento), dataMatricula: data.converter.dataParaInput(aluno.dataMatricula)})
    })

    alunos.post('/editar-veri', fotoUpload.single('foto'), async (req, res) => {
        if (req.body.nome === req.body.nomeOrigem && req.body.sexo === req.body.sexoOrigem && req.body.nascimento === req.body.nascimentoOrigem && req.body.cpf === req.body.cpfOrigem && req.body.nomeRes1 === req.body.nomeRes1Origem && req.body.nomeRes2 === req.body.nomeRes2Origem && req.body.telefone === req.body.telefoneOrigem && req.body.email === req.body.emailOrigem && req.body.cep === req.body.cepOrigem && req.body.cidade === req.body.cidadeOrigem && req.body.bairro === req.body.bairroOrigem && req.body.rua === req.body.ruaOrigem && req.body.numero === req.body.numeroOrigem && req.body.complemento === req.body.complementoOrigem && req.body.dataMatricula === req.body.dataMatriculaOrigem && req.body.turma === req.body.turmaOrigem && req.body.situacao === req.body.situacaoOrigem && req.body.observacao === req.body.observacaoOrigem && req.file === undefined) {
            req.flash('erro_msg', 'Você não fez nenhuma alteração')
            res.redirect(307, '/alunos/editar/'+req.body.id)
        } else {
            const aluno = await alunosModels.findOne({nome: String(req.body.nome)})
            if (aluno && aluno.nome != req.body.nomeOrigem) {
                req.flash('erro_msg', 'Já existe um aluno cadastrado com esse nome')
                res.redirect('/alunos/cadastrar')
            } else {
                const turma = await turmasModels.findOne({nome: req.body.turma})
                if (req.file) {
                    fs.unlinkSync(path.resolve(__dirname, '../', 'public', 'alunos', 'fotos', req.body.fotoOrigem.split('/')[Number(req.body.fotoOrigem.split('/').length)-1]))
                    alunosModels.updateOne({_id: req.body.id}, {
                        nome: req.body.nome,
                        sexo: req.body.sexo,
                        nascimento: data.converter.inputParaData(req.body.nascimento),
                        cpf: req.body.cpf,
                        responsavel1: req.body.nomeRes1,
                        responsavel2: req.body.nomeRes2,
                        telefone: req.body.telefone,
                        email: req.body.email,
                        cep: req.body.cep,
                        cidade: req.body.cidade,
                        bairro: req.body.bairro,
                        rua: req.body.rua,
                        numero: req.body.numero,
                        complemento: req.body.complemento,
                        dataMatricula: data.converter.inputParaData(req.body.dataMatricula),
                        turma: turma.id,
                        situacao: req.body.situacao,
                        observacao: req.body.observacao,
                        dataCriacao: data(),
                        foto: `public/alunos/fotos/${req.file.filename}`,
                        dataCriacaoSistema: data.completa()
                    }, () => {
                        req.flash('primario_msg', 'Aluno editado com sucesso')
                        res.redirect('/alunos')
                    })
                } else {
                    alunosModels.updateOne({_id: req.body.id}, {
                        nome: req.body.nome,
                        sexo: req.body.sexo,
                        nascimento: data.converter.input(req.body.nascimento),
                        cpf: req.body.cpf,
                        responsavel1: req.body.nomeRes1,
                        responsavel2: req.body.nomeRes2,
                        telefone: req.body.telefone,
                        email: req.body.email,
                        cep: req.body.cep,
                        cidade: req.body.cidade,
                        bairro: req.body.bairro,
                        rua: req.body.rua,
                        numero: req.body.numero,
                        complemento: req.body.complemento,
                        dataMatricula: data.converter.input(req.body.dataMatricula),
                        turma: turma.id,
                        situacao: req.body.situacao,
                        observacao: req.body.observacao
                    }, () => {
                        req.flash('primario_msg', 'Aluno editado com sucesso')
                        res.redirect('/alunos')
                    })
                }
            }
        }
    })

    alunos.get('/exportar', async (req, res) => {
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
        
        const alunos = await alunosModels.find({})
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
                `${aluno.criação.data} as ${aluno.criação.hora}`
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
        const caminhoPlanilha = path.resolve(__dirname, '../', 'public', 'planilhas', `${crypto.randomBytes(4).toString('hex')}-alunos.xlsx`)

        planilha.xlsx.writeFile(caminhoPlanilha).then(() => res.download(caminhoPlanilha, 'alunos.xlsx', () => fs.unlinkSync(caminhoPlanilha)))
    })

    alunos.get('/listar', async (req, res) => {
        res.json(await alunosModels.find({}))
    })
// Exportações
    module.exports = alunos