// Importações
    const express = require('express')
    const categoriasDespesas = express.Router()
    const dinero = require('dinero.js')
    const mongoose = require('mongoose')
    // Middlewares
        
    // Models
        const categoriasDespesasModels = require('../../../../models/financeiro/despesas/categorias')
        const despesasModels = require('../../../../models/financeiro/despesas')
    // Utils
        const dataUtil = require('../../../../utils/data')
// Config
    // Dinero
        dinero.globalLocale = 'pt-br'
// Grupos de rotas
    
// Rotas solo
    categoriasDespesas.get('/', async (req, res) => {
        const categorias = await categoriasDespesasModels.find({})
        res.json(categorias)
    })

    categoriasDespesas.get('/total', async (req, res) => {
        const categoriasBrutas = await categoriasDespesasModels.find({})

        const categorias = Promise.all(
            categoriasBrutas.map(async categoria => {
                let despesas =  await despesasModels.find({categorias: categoria._id})
                let total = 0
                despesas.map(despesa => total += despesa.precoBruto)
                categoria = {
                    ...categoria._doc,
                    total: total
                }
                
                return categoria
            })
        )

        res.json(await categorias)
    })

    categoriasDespesas.get('/:id', async (req, res) => {
        const categoria = await categoriasDespesasModels.findById(req.params.id)
        res.json(categoria)
    })

    categoriasDespesas.post('/', async (req, res) => {
        const { nome, cor, criação } = req.body

        const categoria = await categoriasDespesasModels.findOne({nome: nome})
        if (categoria) {
            res.json({exists: true})
        } else {            
            const hora = dataUtil.completa(criação).toLocaleTimeString('pt-br').split(':')
            categoriasDespesasModels.create({
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
    
    categoriasDespesas.delete('/:id', async (req, res) => {
        if (mongoose.isValidObjectId(req.params.id)) {
            const categoria = await categoriasDespesasModels.findById(req.params.id)
            if (categoria) {
                const despesasBrutas = await despesasModels.find({})
                const despesas = []
                despesasBrutas.map(despesa => {
                    if (despesa.categorias) {
                        despesa.categorias.map(categoriaDespesa => {
                            if (categoriaDespesa === req.params.id) {
                                despesas.push(despesa.id)
                            }
                        })
                    }
                })
                despesas.map(async despesa => {
                    const despesaFeita = await despesasModels.findById(despesa)
                    const categorias = []
                    despesaFeita.categorias.map(categoriaDespesa => {
                        if (categoriaDespesa != categoria.id) {
                            categorias.push(categoriaDespesa)
                        }
                    })
                    despesaFeita.categorias = categorias
                    await despesaFeita.save()
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
    module.exports = categoriasDespesas