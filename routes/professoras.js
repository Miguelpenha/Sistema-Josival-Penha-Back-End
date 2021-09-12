// Importações
    const express = require('express')
    const professoras = express.Router()
    const excelJs = require('exceljs')
    const path = require('path')
    const crypto = require('crypto')
    const fs = require('fs')
    const { hash } = require('bcryptjs')
    // Úteis
        const data = require('../utils/data')
    // Middlewares
        const veriMiddleware = require('../middlewares/middlewares')
    // Models
        const professorasModels = require('../models/professora')
        const turmasModels = require('../models/turma')
        const alunosModels = require('../models/aluno')
// Config geral
    // Middlewares
        //professoras.use(veriMiddleware.login)
        professoras.use(veriMiddleware.voltar)
// Rotas
    professoras.get('/', async (req, res) => {
        const professoras = await professorasModels.find({}).sort({'criacao.sistema': 'desc'})
        professoras.map((professora, index) => {
            if (professoras.length-1 == index) {
                professora.ultimo = true
            }
            return professora
        })

        res.render('professora/professoras', {professoras: professoras, voltar: req.voltar})
    })

    professoras.get('/cadastrar', async (req, res) => {
        res.render('professora/cadastrar', {voltar: req.voltar, dominio: process.env.DOMINIO, data: data.input()})
    })

    professoras.post('/cadastrar-veri', async (req, res) => {
        const professora = await professorasModels.findOne({nome: String(req.body.nome)})
        if (professora) {
            req.flash('erro_msg', 'Já existe uma professora cadastrada com esse nome')
            res.redirect('/professoras/cadastrar')
        } else {
            const { nome, sexo, login } = req.body
            let { senha } = req.body
            senha = await hash(senha, 10)
            professorasModels.create({
                nome,
                sexo,
                login,
                senha,
                criacao: {
                    data: data(),
                    hora: data.hora(),
                    sistema: data.completa()
                }
            }).then(() => {
                req.flash('sucesso_msg', 'Professora cadastrada com sucesso')
                res.redirect('/professoras')
            })
        }
    })

    professoras.post('/excluir/:id', async (req, res) => {
        const professora = await professorasModels.findById(req.params.id)
        professorasModels.deleteOne({_id: req.params.id}, (err) => {
            if (err) {
                req.flash('erro_msg', 'Houve um erro ao excluir a professora')
                res.redirect('/professoras')
            } else {
                turmasModels.deleteMany({professora: professora.nome}, () => {
                    alunosModels.deleteMany({professora: professora.nome}, () => {
                        req.flash('sucesso_msg', 'Professora excluida com sucesso, junto com todas as turmas e alunos')
                        res.redirect('/professoras')
                    })
                })
            }
        })
    })

    professoras.post('/excluir-todos/:ids', (req, res) => {
        const ids = req.params.ids.split(',')
        let erros = false
        ids.forEach(async id => {
            const professora = await professorasModels.findById(id)
            professorasModels.deleteOne({_id: id}, (err) => {
                if (err) {
                    erros = true
                }
                turmasModels.deleteMany({professora: professora.nome}, async () => {
                    await alunosModels.deleteMany({professora: professora.nome})
                })
            })
        })
        if (erros) {
            req.flash('erro_msg', 'Houve um erro ao excluir a professora')
            res.redirect('/professoras')
        } else {
            req.flash('sucesso_msg', 'Professoras excluidas com sucesso, junto com todas as turmas e alunos')
            res.redirect('/professoras')
        }
    })

    professoras.post('/editar/:id', async (req, res) => {
        const professora = await professorasModels.findById(req.params.id)
        const sexos = ['Masculino', 'Feminino']
        sexos.splice(sexos.indexOf(professora.sexo), 1)
        res.render('professora/editar', {professora: professora, sexos: sexos})
    })
    
    professoras.post('/editar-veri', async (req, res) => {
        if (req.body.nome === req.body.nomeOrigem && req.body.sexo === req.body.sexoOrigem) {
            req.flash('erro_msg', 'Você não fez nenhuma alteração')
            res.redirect(307, '/professoras/editar/'+req.body.id)
        } else {
            const professora = await professorasModels.findOne({nome: String(req.body.nome)})
            if (professora && professora.nome != req.body.nomeOrigem) {
                req.flash('erro_msg', 'Já existe uma professora cadastrada com esse nome')
                res.redirect('/professoras/cadastrar')
            } else {
                professorasModels.updateOne({_id: req.body.id}, {
                    nome: req.body.nome,
                    sexo: req.body.sexo
                }, err => {
                    if (err) {
                        req.flash('erro_msg', 'Erro ao editar a professora')
                        res.redirect('/professoras')
                    } else {
                        turmasModels.updateMany({professora: req.body.nomeOrigem}, {
                            professora: req.body.nome
                        }, err => {
                            if (err) {
                                req.flash('erro_msg', 'Erro ao editar a professora')
                                res.redirect('/professoras')
                            } else {
                                alunosModels.updateMany({professora: req.body.nomeOrigem}, {
                                    professora: req.body.nome
                                }, err => {
                                    if (err) {
                                        req.flash('erro_msg', 'Erro ao editar a professora')
                                        res.redirect('/professoras')
                                    } else {
                                        req.flash('primario_msg', 'Professora editada com sucesso')
                                        res.redirect('/professoras')
                                    }
                                })
                            }
                        })   
                    }
                })
            }
        }
    })

    professoras.get('/exportar', async (req, res) => {
        const planilha = new excelJs.Workbook()
        const pagina = planilha.addWorksheet('Professoras')
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
                header: 'Turmas: ', 
                key: 'turmas', 
                width: 25
            },
            {
                header: 'Data de cadastro no sistema: ', 
                key: 'criacao.data:criacao.hora', 
                width: 25
            }
        ]
        const professoras = await professorasModels.find({})
        professoras.map((professora, index) => {
            pagina.addRow([
                professora.nome,
                professora.sexo,
                professora.turmas,
                `${professora.criacao.data} as ${professora.criacao.hora}`
            ])
            pagina.findCell('A'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('B'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('C'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('D'+(index+2)).alignment = {horizontal: 'center'}
        })
        const caminhoPlanilha = path.resolve(__dirname, '../', 'public', 'planilhas', `${crypto.randomBytes(4).toString('hex')}-professoras.xlsx`)
        planilha.xlsx.writeFile(caminhoPlanilha).then(() => {
            res.download(caminhoPlanilha, 'professoras.xlsx', () => {
                fs.unlinkSync(caminhoPlanilha)
            })
        })
    })

    professoras.get('/listar', async (req, res) => {
        res.json(await professorasModels.find({}))
    })
// Exportações
    module.exports = professoras