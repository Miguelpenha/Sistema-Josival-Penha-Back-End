// Importações
    const express = require('express')
    const api = express.Router()
    const multer = require('multer')
    const probe = require('probe-image-size')
    const aws = require('aws-sdk')
    const s3 = new aws.S3()
    const sendGrid = require('@sendgrid/mail')
    const handlebars = require('handlebars')
    const fs = require('fs')
    const path = require('path')
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
    // Middlewares
        const middlewareAPI = require('../../middlewares/middlewareAPI')
// Config
    // Multer
        const fotoUpload = multer(configMulter.foto)
    // Middlewares
        api.use(middlewareAPI)
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
        const { width, height } = await probe(url)
        const { id } = req.body

        const foto = {
            nome,
            key,
            tamanho: tamanho/(1024*1024),
            tipo,
            url,
            width,
            height
        }

        const aluno = await alunosModels.findById(id)

        const keyFotoAntiga = String(aluno.foto.key)

        aluno.foto = foto

        await aluno.save()

        if (process.env.ARMAZENAMENTO === 's3') {
            s3.deleteObject({
                Bucket: process.env.AWS_NAME_BUCKET,
                Key: keyFotoAntiga
            }, (err, data) => {
                
            })
        } else {
            if (keyFotoAntiga != 'Padrão.jpg') {
                fs.unlinkSync(path.resolve(__dirname, '../', '../', 'public', 'alunos', 'fotos', keyFotoAntiga))
            }
        }

        res.json({ok: true})
    })
// Exportações
    module.exports = api