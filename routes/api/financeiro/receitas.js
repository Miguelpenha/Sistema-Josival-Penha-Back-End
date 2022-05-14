const express = require('express')
const receitas = express.Router()
const dinero = require('dinero.js')
const mongoose = require('mongoose')
const receitasModels = require('../../../models/financeiro/receitas')
const alunosModels = require('../../../models/aluno')
const dataUtil = require('../../../utils/data')
const { v4: uuid } = require('uuid')
const mesesNumbers = require('../../../mesesNumbers')

dinero.globalLocale = 'pt-br'

receitas.get('/', async (req, res) => {
    if (req.query.quant) {
        const receitas = await receitasModels.find({}).select('id')
        
        res.json({quant: receitas.length+1})
    } else {
        const { month } = req.query
        const receitas = await receitasModels.find({})
        const alunos = await alunosModels.find()
        let mensalidades = 0
        let months = {}
        const criação = new Date()
        const hora = dataUtil.completa(criação).toLocaleTimeString('pt-br').split(':')

        let receitaMensalidades = {
            _id: uuid(),
            nome: 'Mensalidades dos alunos',
            investimento: false,
            fixa: true,
            auto: true,
            fixaDay: '12',
            criação: {
                data: criação.toLocaleDateString('pt-br'),
                hora: `${hora[0]}:${hora[1]}`,
                sistema: criação.toISOString()
            }
        }

        if (month === 'full' || !month) {
            alunos.map(aluno => {
                mesesNumbers.map(mês => {
                    const pagamento = aluno.pagamentos[mês]

                    if (pagamento.pago) {
                        mensalidades+=pagamento.valueBruto

                        months[mês] = {
                            preco: dinero({ amount: months[mês] ? months[mês].valueBruto+pagamento.valueBruto : pagamento.valueBruto, currency: 'BRL' }).toFormat(),
                            precoBruto: months[mês] ? months[mês].valueBruto+pagamento.valueBruto : pagamento.valueBruto
                        }
                    } else {
                        if (!months[mês]) {
                            months[mês] = {
                                preco: 'R$ 0,00',
                                precoBruto: 0
                            }
                        }
                    }
                })
            })
        } else {
            alunos.map(aluno => {
                mensalidades+=aluno.pagamentos[month].pago && aluno.pagamentos[month].valueBruto
                
                mesesNumbers.map(mês => {
                    const pagamento = aluno.pagamentos[mês]

                    if (pagamento.pago) {
                        months[mês] = {
                            preco: dinero({ amount: months[mês] ? months[mês].valueBruto+pagamento.valueBruto : pagamento.valueBruto, currency: 'BRL' }).toFormat(),
                            precoBruto: months[mês] ? months[mês].valueBruto+pagamento.valueBruto : pagamento.valueBruto
                        }
                    } else {
                        if (!months[mês]) {
                            months[mês] = {
                                preco: 'R$ 0,00',
                                precoBruto: 0
                            }
                        }
                    }
                })
            })
        }

        if (alunos.length <= 0) {
            mesesNumbers.map(mês => {
                months[mês] = {
                    preco: 'R$ 0,00',
                    precoBruto: 0
                }
            })
        }

        receitaMensalidades.preco = dinero({ amount: mensalidades, currency: 'BRL' }).toFormat()
        receitaMensalidades.precoBruto = mensalidades
        receitaMensalidades.months = months
        
        receitas.push(receitaMensalidades)
        
        res.json(receitas)
    }
})

receitas.get('/total', async (req, res) => {
    const receitas = await receitasModels.find({})
    const alunos = await alunosModels.find()
    let mensalidades = 0
    const criação = new Date()
    const hora = dataUtil.completa(criação).toLocaleTimeString('pt-br').split(':')
    const { month } = req.query

    if (month === 'full') {
        alunos.map(aluno => {
            mesesNumbers.map(mês => {
                mensalidades+=aluno.pagamentos[mês].pago && aluno.pagamentos[mês].valueBruto
            })
        })
    } else {
        alunos.map(aluno => {
            mensalidades+=aluno.pagamentos[month || new Date().toLocaleDateString('pt-br').split('/')[1]].pago && aluno.pagamentos[month || new Date().toLocaleDateString('pt-br').split('/')[1]].valueBruto
        })
    }

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
    if (receita || nome === 'Mensalidades dos alunos') {
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
        
        receitasModels.create({
            nome,
            preco: precoChecked,
            precoBruto,
            data: fixa ? undefined : data,
            dataSistema: fixa ? undefined : dataSistema,
            investimento,
            fixa,
            fixaDay: fixa ? fixaDay : undefined,
            observação,
            months: fixa ? {
                '01': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/01/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${new Date().toLocaleDateString().split('/')[2]}/01/${fixaDay}`).toISOString(),
                    observação: ''
                },
                '02': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/02/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${new Date().toLocaleDateString().split('/')[2]}/02/${fixaDay}`).toISOString(),
                    observação: ''
                },
                '03': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/03/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${new Date().toLocaleDateString().split('/')[2]}/03/${fixaDay}`).toISOString(),
                    observação: ''
                },
                '04': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/04/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${new Date().toLocaleDateString().split('/')[2]}/04/${fixaDay}`).toISOString(),
                    observação: ''
                },
                '05': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/05/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${new Date().toLocaleDateString().split('/')[2]}/05/${fixaDay}`).toISOString(),
                    observação: ''
                },
                '06': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/06/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${new Date().toLocaleDateString().split('/')[2]}/06/${fixaDay}`).toISOString(),
                    observação: ''
                },
                '07': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/07/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${new Date().toLocaleDateString().split('/')[2]}/07/${fixaDay}`).toISOString(),
                    observação: ''
                },
                '08': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/08/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${new Date().toLocaleDateString().split('/')[2]}/08/${fixaDay}`).toISOString(),
                    observação: ''
                },
                '09': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/09/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${new Date().toLocaleDateString().split('/')[2]}/09/${fixaDay}`).toISOString(),
                    observação: ''
                },
                '10': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/10/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${new Date().toLocaleDateString().split('/')[2]}/10/${fixaDay}`).toISOString(),
                    observação: ''
                },
                '11': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/11/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${new Date().toLocaleDateString().split('/')[2]}/11/${fixaDay}`).toISOString(),
                    observação: ''
                },
                '12': {
                    precoBruto: precoBruto,
                    preco: precoChecked,
                    pago: false,
                    vencimento: `${fixaDay}/12/${new Date().toLocaleDateString().split('/')[2]}`,
                    vencimentoSistema: new Date(`${new Date().toLocaleDateString().split('/')[2]}/12/${fixaDay}`).toISOString(),
                    observação: ''
                }
            } : undefined,
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
        if (receita && receita.nome !== 'Mensalidades dos alunos') {
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
    Object.keys(req.body).map(key => req.body[key] = req.body[key] ? req.body[key] : undefined)
    const { id } = req.params
    let { nome, preco, data: dataSistema, investimento, fixa, fixaDay, observação, months } = req.body
    const receita = await receitasModels.findById(id)
    
    if (!receita && nome === 'Mensalidades dos alunos') {
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
        receita.months = months

        receita.save()
        .then(() => res.json({edited: true}))
        .catch(() => res.json({edited: false}))
    }
})

module.exports = receitas