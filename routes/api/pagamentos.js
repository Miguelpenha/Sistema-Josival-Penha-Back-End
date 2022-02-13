const express = require('express')
const pagamentos = express.Router()
const alunosModels = require('../../models/aluno')
const dinero = require('dinero.js')

pagamentos.get('/:id', async (req, res) => {
    const { id } = req.params

    const pagamentos = (await alunosModels.findById(id)).pagamentos

    res.json(pagamentos)
})

pagamentos.post('/', async (req, res) => {
    let { id, mês, value, pago, vencimento, forma } = req.body
    const pagamentos = (await alunosModels.findById(id)).pagamentos

    if (pagamentos) {
        try {
            value.includes(',') ? null : value = `${value},00`
            value = Number(
                value.replace('.', '')
                .replace(',', '')
                .replace('R$', '')
                .trimStart()
            )
        } catch {
            
        }

        pagamentos[mês] = {
            value: dinero({ amount: value || 0, currency: 'BRL' }).toFormat(),
            valueBruto: value || 0,
            pago,
            vencimento,
            vencimentoSistema: new Date(`${vencimento.split('/')[2]}/${vencimento.split('/')[1]}/${vencimento.split('/')[0]}`).toISOString(),
            forma
        }

        alunosModels.findByIdAndUpdate(id, {
            pagamentos
        })
        .then(() => res.json({edited: true}))
        .catch(() => res.json({edited: false}))
    } else {
        res.json({exists: false})
    }
})

module.exports = pagamentos