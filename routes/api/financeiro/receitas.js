const express = require('express')
const receitas = express.Router()
const dinero = require('dinero.js')
const mongoose = require('mongoose')
const receitasModels = require('../../../models/financeiro/receitas')
const dataUtil = require('../../../utils/data')

dinero.globalLocale = 'pt-br'

receitas.get('/', async (req, res) => {
    if (req.query.quant) {
        const receitas = await receitasModels.find({}).select('id')
                
        res.json({quant: receitas.length})
    } else {
        const receitas = await receitasModels.find({})
        
        res.json(receitas)
    }
})

receitas.get('/total', async (req, res) => {
    const receitas = await receitasModels.find({})
    let total = 0
    receitas.map(receita => {
        total += receita.precoBruto
    })
    
    res.json({
        total: dinero({ amount: total, currency: 'BRL' }).toFormat(),
        totalBruto: total
    })
})

receitas.post('/', async (req, res) => {
    let { nome, preco, data: dataSistema, investimento, fixa, fixaDay, observação, criação } = req.body
    const receita = await receitasModels.findOne({nome: nome})
    if (receita) {
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
        receitasModels.create({
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

receitas.delete('/:id', async (req, res) => {
    if (mongoose.isValidObjectId(req.params.id)) {
        const receita = await receitasModels.findById(req.params.id)
        if (receita) {
            receita.deleteOne()
            res.json({deleted: true})
        } else {
            res.json({exists: false})
        }
    } else {
        res.json({exists: false})
    }
})

receitas.post('/:id', async (req, res) => {
    const { id } = req.params
    let { nome, preco, data: dataSistema, investimento, fixa, fixaDay, observação } = req.body
    const receita = await receitasModels.findById(id)

    if (!receita) {
        res.json({exists: false})
    } else {
        preco.includes(',') ? null : preco = `${preco},00`
        let precoBruto = Number(
            preco.replace('.', '')
            .replace(',', '')
            .replace('R$', '')
            .trimStart()
        )
        const data = dataUtil.completa(dataSistema).toLocaleDateString('pt-br')

        receita.nome = nome
        receita.preco = dinero({ amount: precoBruto, currency: 'BRL' }).toFormat(),
        receita.precoBruto = precoBruto
        receita.data = fixa ? undefined : data
        receita.dataSistema = fixa ? undefined : dataSistema
        receita.investimento = investimento
        receita.fixa = fixa
        receita.fixaDay = fixa ? fixaDay : undefined
        receita.observação = observação

        receita.save()
        .then(() => res.json({edited: true}))
        .catch(() => res.json({edited: false}))
    }
})

module.exports = receitas