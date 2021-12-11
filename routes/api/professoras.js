// Importações
    const express = require('express')
    const professoras = express.Router()
    const { compare, hash } = require('bcryptjs')
    const { sign, verify, decode } = require('jsonwebtoken')
    const dataUtil = require('../../utils/data')
    const mongoose = require('mongoose')
    // Models
        const professorasModels = require('../../models/professora')
    // Middlewares
        const middlewareAPI = require('../../middlewares/middlewareAPI')
// Confi
    // Middlewares
        professoras.use(middlewareAPI)
// Grupo de rotas
    
// Rotas solo
    professoras.get('/', async (req, res) => {
        if (req.query.quant) {
            const professoras = await professorasModels.find({}).select('id')

            res.json({quant: professoras.length})
        } else {
            const professoras = await professorasModels.find({})

            res.json(professoras)
        }
    })

    professoras.post('/', async (req, res) => {
        const professora = await professorasModels.findOne({nome: String(req.body.nome)})
        if (professora) {
            req.statusCode(400).json({message: 'Já existe uma professora cadastrada com esse nome'})
        } else {
            const { nome, sexo, login } = req.body
            let { senha, criação } = req.body
            const hora = dataUtil.completa(criação).toLocaleTimeString('pt-br').split(':')
            senha = await hash(senha, 10)
            professorasModels.create({
                nome,
                sexo,
                login,
                senha,
                criação: {
                    data: dataUtil.completa(criação).toLocaleDateString('pt-br'),
                    hora: `${hora[0]}:${hora[1]}`,
                    sistema: dataUtil.completa(criação)
                }
            }).then(() => res.json({created: true}))
        }
    })

    professoras.delete('/:id', async (req, res) => {
        if (mongoose.isValidObjectId(req.params.id)) {
            const professora = await professorasModels.findById(req.params.id)
            if (professora) {
                professora.deleteOne()
                res.json({deleted: true})
            } else {
                res.json({exists: false})
            }
        } else {
            res.json({exists: false})
        }
    })

    professoras.post('/login', async (req, res) => {
        const { login, senha } = req.body
        let professora = (await professorasModels.find({})).filter(professora => professora.login == login)
        if (professora.length == 0) {
            res.json({userNotFound: true})
        } else {
            professora = professora[0]
            if (await compare(senha, professora.senha)) {
                const token = sign({}, process.env.SECRET_JWT, {
                    subject: professora.id,
                    expiresIn: '20s'
                })
                res.json({authenticated: true, token})
            } else {
                res.json({authenticated: false})
            }
        }
    })

    professoras.post('/auth', async (req, res) => {
        const { token } = req.body
        
        try {
            verify(token, process.env.SECRET_JWT)
            const professora = await professorasModels.findById(decode(token).sub)
            if (professora) {
                res.json({})
            } else {
                res.json({notExists: true})
            }
        } catch {
            try {
                const professora = await professorasModels.findById(decode(token).sub)
                if (professora) {
                    const newToken = sign({}, process.env.SECRET_JWT, {
                        subject: (await professorasModels.findById(decode(token).sub)).id,
                        expiresIn: '20s'
                    })
                    res.json({newToken})
                } else {
                    res.json({notExists: true})
                }
            } catch {
                res.status(400)
                res.json('Token inválido')
            }
        }
    })

    professoras.post('/tokenId', async (req, res) => {
        const { token } = req.body
        
        if (decode(token)) {
            try {
                verify(token, process.env.SECRET_JWT)
                const professora = await professorasModels.findById(decode(token).sub)
                if (professora) {
                    res.json({id: professora.id})
                }
            } catch {
                res.json({})
            }
        } else {
            res.json({})
        }
    })
// Exportações
    module.exports = professoras