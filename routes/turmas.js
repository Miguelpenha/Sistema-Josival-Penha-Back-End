// Importações
    const express = require('express')
    const turmas = express.Router()
    const excelJs = require('exceljs')
    const path = require('path')
    const fs = require('fs')
    const crypto = require('crypto')
    // Úteis
        const data = require('../utils/data')
    // Middlewares
        const veriMiddleware = require('../middlewares/middlewares')
    // Models
        const turmasModels = require('../models/turma')
        const professorasModels = require('../models/professora')
        const alunosModels = require('../models/aluno')
// Config geral
    // Middlewares
        //turmas.use(veriMiddleware.login)
        turmas.use(veriMiddleware.voltar)
// Rotas
    turmas.get('/', async (req, res) => {
        const turmas = await turmasModels.find({}).sort({'criacao.sistema': 'desc'})
        turmas.map((turma, index) => {
            if (turmas.length-1 == index) {
                turma.ultimo = true
            }
            return turma
        })
        res.render('turma/turmas', {turmas: turmas, voltar: req.voltar})
    })

    turmas.get('/cadastrar', async (req, res) => {
        const professoras = await professorasModels.find({})
        if (professoras.length == 0) {
            req.flash('erro_msg', 'Você precisa ter professoras cadastradas primeiro')
            res.redirect('/')
        } else {
            res.render('turma/cadastrar', {voltar: req.voltar, professoras})
        }   
    })

    turmas.post('/cadastrar-veri', async (req, res) => {
        const turma = await turmasModels.findOne({nome: req.body.nome})
        if (turma) {
            req.flash('erro_msg', 'Já existe uma turma com esse nome, tente usar outro nome')
            res.redirect('/')
        } else {
            turmasModels.create({
                nome: String(req.body.nome),
                serie: String(req.body.serie),
                turno: String(req.body.turno),
                professora: req.body.professora,
                criacao: {
                    data: data(),
                    hora: data.hora(),
                    sistema: data.completa()
                }
            }).then(async () => {
                const professora = await professorasModels.findOne({nome: req.body.professora})
                professora.turmas = professora.turmas+1
                professora.save().then(() => {
                    req.flash('sucesso_msg', 'Turma cadastrada com sucesso')
                    res.redirect('/turmas')
                }).catch(() => {
                    req.flash('erro_msg', 'Houve um erro ao criar a turma')
                    res.redirect('/turmas')
                })
            }).catch(() => {
                req.flash('erro_msg', 'Houve um erro ao criar a turma')
                res.redirect('/turmas')
            })
        }
    })

    turmas.post('/excluir/:id', async (req, res) => {
        const turma = await turmasModels.findById(req.params.id)
        turma.deleteOne(async err => {
            if (err) {
                req.flash('erro_msg', 'Houve um erro ao excluir a turma')
                res.redirect('/turmas')
            } else {
                const professora = await professorasModels.findOne({nome: turma.professora})
                professora.turmas = professora.turmas-1
                professora.save().then(() => {
                    alunosModels.deleteMany({turma: turma.nome}, (err) => {
                        if (err) {
                            req.flash('erro_msg', 'Houve um erro ao excluir os alunos da turma')
                            res.redirect('/turmas')
                        } else {
                            req.flash('sucesso_msg', 'Turma excluida com sucesso, junto com os alunos dessa turma')
                            res.redirect('/turmas')
                        }
                    })
                }).catch(() => {
                    req.flash('erro_msg', 'Houve um erro ao excluir a turma')
                    res.redirect('/turmas')
                })
            }
        })
    })

    turmas.post('/excluir-todos/:ids', (req, res) => {
        const ids = req.params.ids.split(',')
        let erros = false
        ids.forEach(async id => {
            const turma = await turmasModels.findById(id)
            const professoraNome = String(turma.professora)
            turmasModels.deleteOne({_id: id}, (err) => {
                if (err) {
                    erros = true
                } else {
                    alunosModels.deleteMany({turma: turma.nome}, async (err) => {
                        if (err) {
                            erros = true
                        } else {
                            const professora = await professorasModels.findOne({nome: professoraNome})
                            professora.turmas = professora.turmas-1
                            professora.save().catch(() => {
                                erros = true
                            })
                        }
                    })
                }
            })
        })
        if (erros) {
            req.flash('erro_msg', 'Houve um erro ao excluir a turma')
            res.redirect('/turmas')
        } else {
            req.flash('sucesso_msg', 'Turma excluida com sucesso, junto com os alunos dessa turma')
            res.redirect('/turmas')
        }
    })

    turmas.post('/editar/:id', async (req, res) => {
        const turma = await turmasModels.findById(req.params.id)
        let series = ['Infantil 1', 'Infantil 2', 'Infantil 3', '1° ano', '2° ano', '3° ano', '4° ano', '5° ano']
        let turnos = ['Manhã', 'Tarde', 'Noite']
        let professoras = []
        let professorasBrutas = await professorasModels.find({})
        professorasBrutas.map(professora => professoras.push(professora.nome))
        series.splice(series.indexOf(turma.serie), 1)
        turnos.splice(turnos.indexOf(turma.turno), 1)
        professoras.splice(professoras.indexOf(turma.professora), 1)
        res.render('turma/editar', {turma, series, turnos, professoras})
    })

    turmas.post('/editar-veri', async (req, res) => {
        if (req.body.nome === req.body.nomeOrigem && req.body.serie === req.body.serieOrigem && req.body.turno === req.body.turnoOrigem && req.body.professora === req.body.professoraOrigem) {
            req.flash('erro_msg', 'Você não fez nenhuma alteração')
            res.redirect(307, '/turmas/editar/'+req.body.id)
        } else {
            const turma = await turmasModels.findById(req.body.id)
            turmasModels.updateOne(turma, {
                nome: req.body.nome,
                serie: req.body.serie,
                turno: req.body.turno,
                professora: req.body.professora
            }, () => {
                alunosModels.updateMany({turma: turma.nome}, {
                    turma: req.body.nome,
                    professora: req.body.professora
                }, async () => {
                    if (req.body.professora != req.body.professoraOrigem) {
                        const professora = await professorasModels.findOne({nome: req.body.professora})
                        professora.turmas = professora.turmas+1
                        await professora.save()
                        const professoraOrigem = await professorasModels.findOne({nome: req.body.professoraOrigem})
                        professoraOrigem.turmas = professoraOrigem.turmas-1
                        await professoraOrigem.save()
                        req.flash('primario_msg', 'Turma editada com sucesso')
                        res.redirect('/turmas')
                    } else {
                        req.flash('primario_msg', 'Turma editada com sucesso')
                        res.redirect('/turmas')
                    }
                })
            })
        }
    })

    turmas.get('/exportar', async (req, res) => {
        const planilha = new excelJs.Workbook()
        const pagina = planilha.addWorksheet('Turmas')
        pagina.columns = [
            {
                header: 'Nome: ', 
                key: 'nome', 
                width: 25
            },
            {
                header: 'Quantidade de alunos: ', 
                key: 'alunos', 
                width: 25
            },
            {
                header: 'Série: ', 
                key: 'serie', 
                width: 25
            },
            {
                header: 'Turno: ', 
                key: 'turno', 
                width: 25
            },
            {
                header: 'Professora: ', 
                key: 'professora', 
                width: 25
            },
            {
                header: 'Data de cadastro no sistema: ', 
                key: 'criacao.data:criacao.hora', 
                width: 25
            }
        ]
        const turmas = await turmasModels.find({})
        turmas.map((turma, index) => {
            pagina.addRow([
                turma.nome,
                turma.alunos,
                turma.serie,
                turma.turno,
                turma.professora,
                `${turma.criacao.data} as ${turma.criacao.hora}`
            ])
            pagina.findCell('A'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('B'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('C'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('D'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('E'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('F'+(index+2)).alignment = {horizontal: 'center'}
        })
        const caminhoPlanilha = path.resolve(__dirname, '../', 'public', 'planilhas', `${crypto.randomBytes(4).toString('hex')}-turmas.xlsx`)
        planilha.xlsx.writeFile(caminhoPlanilha).then(() => {
            res.download(caminhoPlanilha, 'turmas.xlsx', () => {
                fs.unlinkSync(caminhoPlanilha)
            })
        })
    })

    turmas.get('/listar', async (req, res) => {
        res.json(await turmasModels.find({}).sort({alunos: -1}))
    })
// Exportações
    module.exports = turmas