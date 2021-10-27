// Importações
    const express = require('express')
    const fontes = express.Router()
    const dinero = require('dinero.js')
    const mongoose = require('mongoose')
    // Middlewares
        
    // Models
        const fontesReceitasModels = require('../../../../models/financeiro/receitas/fontes')
        const receitasModels = require('../../../../models/financeiro/receitas')
    // Utils
        const dataUtil = require('../../../../utils/data')
// Config
    // Dinero
        dinero.globalLocale = 'pt-br'
// Grupos de rotas
    
// Rotas solo
    fontes.get('/', async (req, res) => {
        const fontes = await fontesReceitasModels.find({})
        res.json(fontes)
    })

    fontes.get('/:id', async (req, res) => {
        const fonte = await fontesReceitasModels.findById(req.params.id)
        res.json(fonte)
    })

    fontes.post('/', async (req, res) => {
        const { nome, cor, criação } = req.body
        
        const fonte = await fontesReceitasModels.findOne({nome: nome})
        if (fonte) {
            res.json({exists: true})
        } else {            
            const hora = dataUtil.completa(criação).toLocaleTimeString('pt-br').split(':')
            fontesReceitasModels.create({
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
    
    fontes.delete('/:id', async (req, res) => {
        if (mongoose.isValidObjectId(req.params.id)) {
            const fonte = await fontesReceitasModels.findById(req.params.id)
            if (fonte) {
                const receitasBrutas = await receitasModels.find({})
                const receitas = []
                receitasBrutas.map(receita => {
                    if (receita.fontes) {
                        receita.fontes.map(fonteDespesa => {
                            if (fonteDespesa === req.params.id) {
                                receitas.push(receita.id)
                            }
                        })
                    }
                })
                receitas.map(async receita => {
                    const receitaFeita = await receitasModels.findById(receita)
                    const fontes = []
                    receitaFeita.fontes.map(fonteDespesa => {
                        if (fonteDespesa != fonte.id) {
                            fontes.push(fonteDespesa)
                        }
                    })
                    receitaFeita.fontes = fontes
                    await receitaFeita.save()
                })
                await fonte.deleteOne()
                res.json({deleted: true})
            } else {
                res.json({exists: false})
            }
        } else {
            res.json({exists: false})
        }
    })
// Exportações
    module.exports = fontes