const express = require('express')
const fontes = express.Router()
const dinero = require('dinero.js')
const mongoose = require('mongoose')
const fontesDespesasModels = require('../../../../models/financeiro/despesas/fontes')
const despesasModels = require('../../../../models/financeiro/despesas')
const dataUtil = require('../../../../utils/data')

dinero.globalLocale = 'pt-br'

fontes.get('/', async (req, res) => {
    const fontes = await fontesDespesasModels.find({})
    res.json(fontes)
})

fontes.get('/:id', async (req, res) => {
    const fonte = await fontesDespesasModels.findById(req.params.id)
    res.json(fonte)
})

fontes.post('/', async (req, res) => {
    const { nome, cor, criação } = req.body
    
    const fonte = await fontesDespesasModels.findOne({nome: nome})
    if (fonte) {
        res.json({exists: true})
    } else {            
        const hora = dataUtil.completa(criação).toLocaleTimeString('pt-br').split(':')
        fontesDespesasModels.create({
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
        const fonte = await fontesDespesasModels.findById(req.params.id)
        if (fonte) {
            const despesasBrutas = await despesasModels.find({})
            const despesas = []
            despesasBrutas.map(despesa => {
                if (despesa.fontes) {
                    despesa.fontes.map(fonteDespesa => {
                        if (fonteDespesa === req.params.id) {
                            despesas.push(despesa.id)
                        }
                    })
                }
            })
            despesas.map(async despesa => {
                const despesaFeita = await despesasModels.findById(despesa)
                const fontes = []
                despesaFeita.fontes.map(fonteDespesa => {
                    if (fonteDespesa != fonte.id) {
                        fontes.push(fonteDespesa)
                    }
                })
                despesaFeita.fontes = fontes
                await despesaFeita.save()
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

module.exports = fontes