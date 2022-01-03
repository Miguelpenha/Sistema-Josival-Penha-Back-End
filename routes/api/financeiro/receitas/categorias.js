const express = require('express')
const categoriasReceitas = express.Router()
const dinero = require('dinero.js')
const mongoose = require('mongoose')
const categoriasReceitasModels = require('../../../../models/financeiro/receitas/categorias')
const receitasModels = require('../../../../models/financeiro/receitas')
const dataUtil = require('../../../../utils/data')

dinero.globalLocale = 'pt-br'

categoriasReceitas.get('/', async (req, res) => {
    const categorias = await categoriasReceitasModels.find({})
    res.json(categorias)
})

categoriasReceitas.get('/total', async (req, res) => {
    const categoriasBrutas = await categoriasReceitasModels.find({})

    const categorias = Promise.all(
        categoriasBrutas.map(async categoria => {
            let receitas =  await receitasModels.find({categorias: categoria._id})
            let total = 0
            receitas.map(receita => total += receita.precoBruto)
            categoria = {
                ...categoria._doc,
                total: total
            }
            
            return categoria
        })
    )

    res.json(await categorias)
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

module.exports = categoriasReceitas