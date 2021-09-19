// Importações
    const express = require('express')
    const gastos = express.Router()
    const dinero = require('dinero.js')
    const excelJs = require('exceljs')
    const path = require('path')
    const crypto = require('crypto')
    const fs = require('fs')
    // Úteis
        const data = require('../../../utils/data')
    // Middlewares
        const veriMiddleware = require('../../../middlewares/middlewares')
    // Models
        const gastosModels = require('../../../models/financeiro/despesas')
        const categoriasGastosModels = require('../../../models/financeiro/despesas/categorias')
    // Middlewares
        gastos.use(veriMiddleware.login)
        gastos.use(veriMiddleware.voltar)
    // Routes
        const categoriasRouter = require('./categorias')
// Config Geral
    // Dinero
        dinero.globalLocale = 'pt-br'
    // Rotas
        gastos.use('/categorias', categoriasRouter)
// Rotas solo
    gastos.get('/', async (req, res) => {
        const gastos = await gastosModels.find({}).sort({precoBruto: 'desc'})
        let total = 0
        gastos.map((gasto, index) => {
            if (gastos.length-1 == index) {
                gasto.ultimo = true
            }
            let categoriasProntas = ''
            gasto.categorias.map((categoria, index) => {
                if (index == 0) {
                    categoriasProntas = categoriasProntas + categoria
                } else {
                    categoriasProntas = categoriasProntas + ', ' + categoria
                }
            })
            gasto.categoriasProntas = categoriasProntas
            total += gasto.precoBruto
            return gasto
        })
        total = dinero({ amount: total, currency: 'BRL' }).toFormat()
        res.render('financeiro/gastos/gastos/gastos', {gastos: gastos, voltar: req.voltar, total})
    })

    gastos.get('/cadastrar', async (req, res) => {
        const categoriasGastosBrutos = await categoriasGastosModels.find({})
        res.render('financeiro/gastos/gastos/cadastrar', {voltar: req.voltar, hoje: data.input(), categoriasGastos: categoriasGastosBrutos})
    })

    gastos.post('/cadastrar-veri', (req, res) => {
        let { nome, preco, categorias, data: dataGasto, investimento } = req.body
        categorias = categorias.split(',').filter(categoria => categoria != '')
        dataGasto = data.converter.inputParaData(dataGasto)
        investimento === 'false' ? investimento = false : investimento = true
        let addCents = false
        preco.includes(',') ? addCents = false : addCents = true
        preco.includes(',') ? preco = preco.replace(',', '') : null
        preco.includes('.') ? preco = preco.replace('.', '') : null
        preco.includes('R$') ? preco = preco.replace('R$', '').trimStart() : null
        preco = Number(preco)
        if (addCents) {
            preco = Number(String(preco)+'00')
        }
        gastosModels.create({
            nome,
            preco: dinero({ amount: preco, currency: 'BRL' }).toFormat(),
            precoBruto: preco,
            categorias: categorias,
            data: dataGasto,
            dataSistema: data.converter.dataParaDate(dataGasto),
            investimento: investimento,
            criacao: {
                data: data(),
                hora: data.hora(),
                sistema: data.completa()
            }
        }).then(() => {
            req.flash('sucesso_msg', 'Gasto criado com sucesso')
            res.redirect('/financeiro/gastos')
        })
    })

    gastos.post('/excluir/:id', (req, res) => {
        const { id } = req.params
        gastosModels.findByIdAndDelete(id, (err, doc) => {
            if (!doc) {
                req.flash('erro_msg', 'Houve um erro ao excluir o gasto')
                res.redirect('/financeiro/gastos')
            } else {
                req.flash('sucesso_msg', 'Gasto excluido com sucesso')
                res.redirect('/financeiro/gastos')
            }
        })
    })

    gastos.post('/excluir-todos/:ids', (req, res) => {
        const ids = req.params.ids.split(',')
        let erros = false
        ids.forEach(async id => {
            const gasto = await gastosModels.findById(id)
            gasto.deleteOne((err) => {
                if (err) {
                    erros = true
                }
            })
        })
        if (erros) {
            req.flash('erro_msg', 'Houve um erro ao excluir os gastos')
            res.redirect('/financeiro/gastos')
        } else {
            req.flash('sucesso_msg', 'Gastos excluidos com sucesso!')
            res.redirect('/financeiro/gastos')
        }
    })

    gastos.post('/editar/:id', async (req, res) => {
        const gasto = await gastosModels.findById(req.params.id)
        const categorias = await categoriasGastosModels.find({})
        let categoriasOrigem = ''
        categorias.map(categoria => {
            if (gasto.categorias.includes(categoria.nome)) {
                categoria.usado = true
            }
        })
        gasto.categorias.map(categoria => {
            if (categoriasOrigem.length === 0) {
                categoriasOrigem = categoria
            } else {
                categoriasOrigem = `${categoriasOrigem},${categoria}`
            }
        })
        if (categoriasOrigem.length === 0){ 
            categoriasOrigem = undefined
        }
        res.render('financeiro/gastos/gastos/editar', {gasto: gasto, hoje: data.converter.dataParaInput(gasto.criacao.data), categorias, categoriasOrigem})
    })

    gastos.post('/editar-veri', async (req, res) => {
        let { nome, preco, nomeOrigem, precoOrigem, investimento, investimentoOrigem, categorias, categoriasOrigem, data: dataGasto, dataOrigem } = req.body
        categorias = categorias.split(',').filter(categoria => categoria != '')
        categoriasOrigem = categoriasOrigem.split(',').filter(categoria => categoria != '')
        investimento === 'false' ? investimento = false : investimento = true
        if (nome == nomeOrigem && preco == precoOrigem && investimento == investimentoOrigem && dataGasto == dataOrigem && categorias == categoriasOrigem) {
            req.flash('erro_msg', 'Você não fez nenhuma alteração')
            res.redirect(307, '/financeiro/gastos/editar/'+req.body.id)
        } else {
            let addCents = false
            preco.includes(',') ? addCents = false : addCents = true
            preco.includes(',') ? preco = preco.replace(',', '') : null
            preco.includes('.') ? preco = preco.replace('.', '') : null
            preco.includes('R$') ? preco = preco.replace('R$', '').trimStart() : null
            preco = Number(preco)
            if (addCents) {
                preco = Number(String(preco)+'00')
            }
            dataGasto = data.converter.inputParaData(dataGasto)
            gastosModels.updateOne({_id: req.body.id}, {
                nome,
                preco: dinero({ amount: preco, currency: 'BRL' }).toFormat(),
                precoBruto: preco,
                categorias: categorias,
                data: dataGasto,
                dataSistema: data.converter.dataParaDate(dataGasto),
                investimento
            }, err => {
                if (err) {
                    req.flash('erro_msg', 'Erro ao editar o gasto')
                    res.redirect('/financeiro/gastos')
                } else {
                    req.flash('sucesso_msg', 'Gasto editado com sucesso')
                    res.redirect('/financeiro/gastos')
                }
            })
        }
    })

    gastos.get('/exportar', async (req, res) => {
        const planilha = new excelJs.Workbook()
        const pagina = planilha.addWorksheet('Gastos')
        pagina.columns = [
            {
                header: 'Nome: ', 
                key: 'nome', 
                width: 25
            },
            {
                header: 'Preço: ', 
                key: 'preco', 
                width: 25
            },
            {
                header: 'Data de cadastro no sistema: ', 
                key: 'criacao.data:criacao.hora', 
                width: 25
            }
        ]
        const gastos = await gastosModels.find({}).sort({precoBruto: 'desc'})
        gastos.map((gasto, index) => {
            pagina.addRow([
                gasto.nome,
                gasto.preco,
                `${gasto.criacao.data} as ${gasto.criacao.hora}`
            ])
            pagina.findCell('A'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('B'+(index+2)).alignment = {horizontal: 'center'}
            pagina.findCell('C'+(index+2)).alignment = {horizontal: 'center'}
        })
        const caminhoPlanilha = path.resolve(__dirname, '../', '../', 'public', 'planilhas', `${crypto.randomBytes(4).toString('hex')}-gastos.xlsx`)
        planilha.xlsx.writeFile(caminhoPlanilha).then(() => {
            res.download(caminhoPlanilha, 'gastos.xlsx', () => {
                fs.unlinkSync(caminhoPlanilha)
            })
        })
    })

    gastos.get('/listar', async (req, res) => {
        const gastos = await gastosModels.find({}).sort({precoBruto: 'desc'})
        res.json(gastos)
    })
// Exportações
    module.exports = gastos