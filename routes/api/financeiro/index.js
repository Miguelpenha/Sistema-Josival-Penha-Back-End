const express = require('express')
const financeiro = express.Router()
const dinero = require('dinero.js')
const despesasModels = require('../../../models/financeiro/despesas')
const receitasModels = require('../../../models/financeiro/receitas')
const alunosModels = require('../../../models/aluno')
const despesasRouter = require('./despesas')
const receitasRouter = require('./receitas')
const dataUtil = require('../../../utils/data')
const { v4: uuid } = require('uuid')

dinero.globalLocale = 'pt-br'

financeiro.use('/despesas', despesasRouter)
financeiro.use('/receitas', receitasRouter)

financeiro.get('/saldo', async (req, res) => {
    const receitas = await receitasModels.find({})
    const despesas = await despesasModels.find({})
    let totalReceitas = 0
    let totalDespesas = 0
    const alunos = await alunosModels.find()
    let mensalidades = 0
    const criação = new Date()
    const hora = dataUtil.completa(criação).toLocaleTimeString('pt-br').split(':')

    alunos.map(aluno => {
        mensalidades+=aluno.pagamentos[new Date().toLocaleDateString().split('/')[1]].pago && aluno.pagamentos[new Date().toLocaleDateString().split('/')[1]].valueBruto
    })

    receitas.push({
        _id: uuid(),
        nome: 'Mensalidades dos alunos',
        precoBruto: mensalidades,
        preco: dinero({ amount: mensalidades, currency: 'BRL' }).toFormat(),
        investimento: false,
        fixa: true,
        auto: true,
        observação: '',
        fixaDay: '12',
        criação: {
            data: criação.toLocaleDateString('pt-br'),
            hora: `${hora[0]}:${hora[1]}`,
            sistema: criação.toISOString()
        }
    })

    receitas.map(receita => totalReceitas += receita.precoBruto)
    despesas.map(despesa => totalDespesas += despesa.precoBruto)

    const saldo = totalReceitas - totalDespesas
    
    res.json({
        saldo: dinero({ amount: saldo, currency: 'BRL' }).toFormat(),
        saldoBruto: saldo
    })
})

financeiro.post('/verify', async (req, res) => {
    const { password } = req.body

    if (password === process.env.PASSWORD_FINANCE) {
        res.json({authorized: true})
    } else {
        res.json({authorized: false})
    }
})

financeiro.get('/date/:date', async (req, res) => {
    const { date: dateBruta } = req.params
    const data = dateBruta.replace(/-/g, '/')
    const receitasBrutas = await receitasModels.find({ data })
    const despesasBrutas = await despesasModels.find({ data })
    const receitasFixas = await receitasModels.find({ fixaDay: data.split('/')[0] })
    const despesasFixas = await despesasModels.find({ fixaDay: data.split('/')[0] })
    const receitas = [...receitasBrutas, ...receitasFixas]
    const despesas = [...despesasBrutas, ...despesasFixas]
    let totalReceitas = 0
    let totalDespesas = 0
    const alunos = await alunosModels.find()
    let mensalidades = 0
    const criação = new Date()
    const hora = dataUtil.completa(criação).toLocaleTimeString('pt-br').split(':')

    alunos.map(aluno => {
        mensalidades+=aluno.pagamentos[new Date().toLocaleDateString().split('/')[1]].pago && aluno.pagamentos[new Date().toLocaleDateString().split('/')[1]].valueBruto
    })

    receitas.push({
        _id: uuid(),
        nome: 'Mensalidades dos alunos',
        precoBruto: mensalidades,
        preco: dinero({ amount: mensalidades, currency: 'BRL' }).toFormat(),
        investimento: false,
        fixa: true,
        auto: true,
        observação: '',
        fixaDay: '12',
        criação: {
            data: criação.toLocaleDateString('pt-br'),
            hora: `${hora[0]}:${hora[1]}`,
            sistema: criação.toISOString()
        }
    })
    
    receitas.map(receita => totalReceitas += receita.precoBruto)
    despesas.map(despesa => totalDespesas += despesa.precoBruto)
    
    res.json({
        receitas,
        despesas,
        totals: {
            receitas: {
                total: dinero({ amount: totalReceitas, currency: 'BRL' }).toFormat(),
                totalBruto: totalReceitas
            },
            despesas: {
                total: dinero({ amount: totalDespesas, currency: 'BRL' }).toFormat(),
                totalBruto: totalDespesas
            },
            saldo: {
                total: dinero({ amount: totalReceitas-totalDespesas, currency: 'BRL' }).toFormat(),
                totalBruto: totalReceitas-totalDespesas
            }
        }
    })
})

module.exports = financeiro