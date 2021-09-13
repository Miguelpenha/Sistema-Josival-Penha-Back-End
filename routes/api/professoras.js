// Importações
    const express = require('express')
    const professoras = express.Router()
    const { compare, hash } = require('bcryptjs')
    const { sign, verify, decode } = require('jsonwebtoken')
    const data = require('../../utils/data')
    // Middlewares
        
    // Models
        const professorasModels = require('../../models/professora')
// Confi
    // Middlewares
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

    professoras.post('/cadastrar', async (req, res) => {
        const professora = await professorasModels.findOne({nome: String(req.body.nome)})
        if (professora) {
            req.statusCode(400).json({message: 'Já existe uma professora cadastrada com esse nome'})
        } else {
            const { nome, sexo, login } = req.body
            let { senha } = req.body
            senha = await hash(senha, 10)
            professorasModels.create({
                nome,
                sexo,
                login,
                senha,
                criacao: {
                    data: data(),
                    hora: data.hora(),
                    sistema: data.completa()
                }
            }).then(() => {
                res.json({message: 'Professora cadastrada com sucesso'})
            })
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