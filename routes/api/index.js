// Importações
    const express = require('express')
    const api = express.Router()
    const multer = require('multer')
    // Middlewares
        
    // Models
        const alunosModels = require('../../models/aluno')
    // Configs 
        const configMulter = require('../../config/multer/multer')

    // Routes
        const professorasRouter = require('./professoras')
        const administrativoRouter = require('./administrativo')
        const alunosRouter = require('./alunos')
        const turmasRouter = require('./turmas')
        const financeiroRouter = require('./financeiro')
    // Utils
        const veriCep = require('../../utils/veriCep')
// Config
    // Multer
        const fotoUpload = multer(configMulter.foto)

    // Middlewares
        api.use((req, res, next) => {
            const keyBruta = req.header('Authorization') || req.body.keyapi
            if (keyBruta) {
                const key = keyBruta.replace('key ', '')
                const keysAuthorizeds = process.env.API_KEYS_AUTHORIZED.split(',')
                
                if (keysAuthorizeds.includes(key)) {
                    next()
                } else {
                    res.status(401)
                    res.json({'unauthorized': true})
                }
            } else {
                res.status(401)
                res.json({'unauthorized': true})
            }
        })
// Grupo de rotas
    api.use('/professoras', professorasRouter)
    api.use('/administrativo', administrativoRouter)
    api.use('/alunos', alunosRouter)
    api.use('/turmas', turmasRouter)
    api.use('/financeiro', financeiroRouter)
// Rotas solo
    api.get('/cep/:cep', async (req, res) => {
        const endereço = await veriCep(req.params.cep)

        res.json(endereço)
    })

    api.patch('/mobile-foto', fotoUpload.single('foto'), async (req, res) => {
        const { originalname: nome, mimetype: tipo, key, size: tamanho, location: url=undefined } = req.file
        const { id } = req.body

        const foto = {
            nome,
            key,
            tamanho: tamanho/(1024*1024),
            tipo,
            url
        }

        const aluno = await alunosModels.findById(id)

        aluno.foto = foto

        await aluno.save()

        res.json({ok: true})
    })
// Exportações
    module.exports = api