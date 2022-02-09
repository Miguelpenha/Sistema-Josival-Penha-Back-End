const express = require('express')
const despesas = express.Router()
const dinero = require('dinero.js')
const mongoose = require('mongoose')
const despesasModels = require('../../../models/financeiro/despesas')
const dataUtil = require('../../../utils/data')

dinero.globalLocale = 'pt-br'

despesas.get('/', async (req, res) => {
    if (req.query.quant) {
        const despesas = await despesasModels.find({}).select('id')
                
        res.json({quant: despesas.length})
    } else {
        const despesas = await despesasModels.find({})
        
        res.json(despesas)
    }
})

despesas.get('/total', async (req, res) => {
    const despesas = await despesasModels.find({})
    let total = 0
    despesas.map(despesa => {
        total += despesa.precoBruto
    })
    
    res.json({
        total: dinero({ amount: total, currency: 'BRL' }).toFormat(),
        totalBruto: total
    })
})

despesas.post('/', async (req, res) => {
    let { nome, preco, data: dataSistema, investimento, fixa, fixaDay, observação, criação } = req.body
    const despesa = await despesasModels.findOne({nome: nome})
    if (despesa) {
        res.json({exists: true})
    } else {
        preco.includes(',') ? null : preco = `${preco},00`
        let precoBruto = Number(
            preco.replace('.', '')
            .replace(',', '')
            .replace('R$', '')
            .trimStart()
        )
        
        const data = dataUtil.completa(dataSistema).toLocaleDateString('pt-br')
        const hora = dataUtil.completa(criação).toLocaleTimeString('pt-br').split(':')
        despesasModels.create({
            nome,
            preco: dinero({ amount: precoBruto, currency: 'BRL' }).toFormat(),
            precoBruto,
            data: fixa ? undefined : data,
            dataSistema: fixa ? undefined : dataSistema,
            investimento,
            fixa,
            fixaDay: fixa ? fixaDay : undefined,
            observação,
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

despesas.delete('/:id', async (req, res) => {
    if (mongoose.isValidObjectId(req.params.id)) {
        const despesa = await despesasModels.findById(req.params.id)
        if (despesa) {
            despesa.deleteOne()
            res.json({deleted: true})
        } else {
            res.json({exists: false})
        }
    } else {
        res.json({exists: false})
    }
})

module.exports = despesas