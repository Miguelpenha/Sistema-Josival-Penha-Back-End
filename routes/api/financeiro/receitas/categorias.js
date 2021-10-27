// Importações
    const express = require('express')
    const categoriasReceitas = express.Router()
    const dinero = require('dinero.js')
    const mongoose = require('mongoose')
    // Middlewares
        
    // Models
        const categoriasReceitasModels = require('../../../../models/financeiro/receitas/categorias')
        const receitasModels = require('../../../../models/financeiro/receitas')
    // Utils
        const dataUtil = require('../../../../utils/data')
// Config
    // Dinero
        dinero.globalLocale = 'pt-br'
// Grupos de rotas
    
// Rotas solo
    categoriasReceitas.get('/', async (req, res) => {
        const categorias = await categoriasReceitasModels.find({})
        res.json(categorias)
    })

    categoriasReceitas.get('/:id', async (req, res) => {
        const categoria = await categoriasReceitasModels.findById(req.params.id)
        res.json(categoria)
    })

    categoriasReceitas.post('/', async (req, res) => {
        const { nome, cor, criação } = req.body

        const categoria = await categoriasReceitasModels.findOne({nome: nome})
        if (categoria) {
            res.json({exists: true})
        } else {            
            const hora = dataUtil.completa(criação).toLocaleTimeString('pt-br').split(':')
            categoriasReceitasModels.create({
                nome,
                cor,
                criação: {
                    data: dataUtil.completa(criação).toLocaleDateString('pt-br'),
                    hora: `${hora[0]}:${hora[1]}`,
                    sistema: dataUtil.completa(criação)
                }
            }).then(() => {
                res.json({created: true})
            }).catch(() => {
                res.json({created: false})
            })
        }
    })
    
    categoriasReceitas.delete('/:id', async (req, res) => {
        if (mongoose.isValidObjectId(req.params.id)) {
            const categoria = await categoriasReceitasModels.findById(req.params.id)
            if (categoria) {
                const receitasBrutas = await receitasModels.find({})
                const receitas = []
                receitasBrutas.map(receita => {
                    if (receita.categorias) {
                        receita.categorias.map(categoriaReceita => {
                            if (categoriaReceita === req.params.id) {
                                receitas.push(receita.id)
                            }
                        })
                    }
                })
                receitas.map(async receita => {
                    const receitaFeita = await receitasModels.findById(receita)
                    const categorias = []
                    receitaFeita.categorias.map(categoriaReceita => {
                        if (categoriaReceita != categoria.id) {
                            categorias.push(categoriaReceita)
                        }
                    })
                    receitaFeita.categorias = categorias
                    await receitaFeita.save()
                })
                await categoria.deleteOne()
                res.json({deleted: true})
            } else {
                res.json({exists: false})
            }
        } else {
            res.json({exists: false})
        }
    })
// Exportações
    module.exports = categoriasReceitas