// Importações
    const express = require('express')
    const gastos = express.Router()
    const dinero = require('dinero.js')
    const mongoose = require('mongoose')
    // Middlewares

    // Models
        const gastosModels = require('../../../../models/financeiro/despesas')
    // Utils
        const dataUtil = require('../../../../utils/data')
    // Routes
        const categoriasGastosRouter = require('./categorias')
// Config
    // Dinero
        dinero.globalLocale = 'pt-br'
// Grupos de rotas
    gastos.use('/categorias', categoriasGastosRouter)
// Rotas solo
    gastos.get('/', async (req, res) => {
        if (req.query.quant) {
            const gastos = await gastosModels.find({}).select('id')
                  
            res.json({quant: gastos.length})
        } else {
            const gastos = await gastosModels.find({})
            
            res.json(gastos)
        }
    })

    gastos.post('/', async (req, res) => {
        const { nome, preco, categorias, data: dataSistema, investimento, criação } = req.body

        const gasto = await gastosModels.findOne({nome: nome})
        if (gasto) {
            res.json({exists: true})
        } else {
            const precoBruto = Number(
                preco.replace('.', '')
                .replace(',', '')
                .replace('R$', '')
                .trimStart()
            )
    
            const data = dataUtil.completa(dataSistema).toLocaleDateString('pt-br')
            const hora = dataUtil.completa(criação).toLocaleTimeString('pt-br').split(':')
            gastosModels.create({
                nome,
                preco: dinero({ amount: precoBruto, currency: 'BRL' }).toFormat(),
                precoBruto,
                categorias,
                data,
                dataSistema,
                investimento,
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

    gastos.delete('/:id', async (req, res) => {
        if (mongoose.isValidObjectId(req.params.id)) {
            const gasto = await gastosModels.findById(req.params.id)
            if (gasto) {
                gasto.deleteOne()
                res.json({deleted: true})
            } else {
                res.json({exists: false})
            }
        } else {
            res.json({exists: false})
        }
    })
// Exportações
    module.exports = gastos