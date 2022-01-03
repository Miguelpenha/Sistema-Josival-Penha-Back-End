const express = require('express')
const receitas = express.Router()
const dinero = require('dinero.js')
const mongoose = require('mongoose')
const receitasModels = require('../../../../models/financeiro/receitas')
const categoriasDespesasModels = require('../../../../models/financeiro/receitas/categorias')
const fontesDespesasModels = require('../../../../models/financeiro/receitas/fontes')
const dataUtil = require('../../../../utils/data')
const categoriasDespesasRouter = require('./categorias')
const fontesDespesasRouter= require('./fontes')

dinero.globalLocale = 'pt-br'

receitas.use('/categorias', categoriasDespesasRouter)
receitas.use('/fontes', fontesDespesasRouter)

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
    let { nome, preco, categorias: categoriasBrutas, fontes: fontesBrutas, data: dataSistema, investimento, fixa, observação, criação } = req.body
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
        const categoriasQuase = await Promise.all(
            categoriasBrutas.map(async categoriaBruta => {
                const categoria = await categoriasDespesasModels.findOne({nome: categoriaBruta})
                if (categoria){ 
                    return categoria.id
                }
            })
        )
        const categorias = []
        categoriasQuase.map(categoria => {
            if (categoria) {
                categorias.push(categoria)
            }
        })

        const fontesQuase = await Promise.all(
            fontesBrutas.map(async fonteBruta => {
                const fonte = await fontesDespesasModels.findOne({nome: fonteBruta})
                if (fonte){ 
                    return fonte.id
                }
            })
        )
        const fontes = []
        fontesQuase.map(fonte => {
            if (fonte) {
                fontes.push(fonte)
            }
        })

        const data = dataUtil.completa(dataSistema).toLocaleDateString('pt-br')
        const hora = dataUtil.completa(criação).toLocaleTimeString('pt-br').split(':')
        receitasModels.create({
            nome,
            preco: dinero({ amount: precoBruto, currency: 'BRL' }).toFormat(),
            precoBruto,
            categorias,
            fontes,
            data,
            dataSistema,
            investimento,
            fixa,
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

module.exports = receitas