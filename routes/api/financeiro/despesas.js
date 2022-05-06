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
        const precoChecked = dinero({ amount: precoBruto, currency: 'BRL' }).toFormat()

        despesasModels.create({
            nome,
            preco: precoChecked,
            precoBruto,
            data: fixa ? undefined : data,
            dataSistema: fixa ? undefined : dataSistema,
            investimento,
            fixa,
            fixaDay: fixa ? fixaDay : undefined,
            observação,
            months: {
                '01': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/01/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${fixaDay}/01/${new Date().toLocaleDateString().split('/')[2]}`).toISOString(),
                    observação: ''
                },
                '02': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/02/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${fixaDay}/02/${new Date().toLocaleDateString().split('/')[2]}`).toISOString(),
                    observação: ''
                },
                '03': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/03/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${fixaDay}/03/${new Date().toLocaleDateString().split('/')[2]}`).toISOString(),
                    observação: ''
                },
                '04': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/04/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${fixaDay}/04/${new Date().toLocaleDateString().split('/')[2]}`).toISOString(),
                    observação: ''
                },
                '05': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/05/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${fixaDay}/05/${new Date().toLocaleDateString().split('/')[2]}`).toISOString(),
                    observação: ''
                },
                '06': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/06/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${fixaDay}/06/${new Date().toLocaleDateString().split('/')[2]}`).toISOString(),
                    observação: ''
                },
                '07': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/07/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${fixaDay}/07/${new Date().toLocaleDateString().split('/')[2]}`).toISOString(),
                    observação: ''
                },
                '08': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/08/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${fixaDay}/08/${new Date().toLocaleDateString().split('/')[2]}`).toISOString(),
                    observação: ''
                },
                '09': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/09/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${fixaDay}/09/${new Date().toLocaleDateString().split('/')[2]}`).toISOString(),
                    observação: ''
                },
                '10': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/10/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${fixaDay}/10/${new Date().toLocaleDateString().split('/')[2]}`).toISOString(),
                    observação: ''
                },
                '11': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/11/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${fixaDay}/11/${new Date().toLocaleDateString().split('/')[2]}`).toISOString(),
                    observação: ''
                },
                '12': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/12/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${fixaDay}/12/${new Date().toLocaleDateString().split('/')[2]}`).toISOString(),
                    observação: ''
                }
            },
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

despesas.post('/:id', async (req, res) => {
    const { id } = req.params
    let { nome, preco, data: dataSistema, investimento, fixa, fixaDay, observação, months } = req.body
    const despesa = await despesasModels.findById(id)

    if (!despesa) {
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

        despesa.nome = nome
        despesa.preco = dinero({ amount: precoBruto, currency: 'BRL' }).toFormat(),
        despesa.precoBruto = precoBruto
        despesa.data = fixa ? undefined : data
        despesa.dataSistema = fixa ? undefined : dataSistema
        despesa.investimento = investimento
        despesa.fixa = fixa
        despesa.fixaDay = fixa ? fixaDay : undefined
        despesa.observação = observação
        despesa.months = months
        
        despesa.save()
        .then(() => res.json({edited: true}))
        .catch(() => res.json({edited: false}))
    }
})

module.exports = despesas