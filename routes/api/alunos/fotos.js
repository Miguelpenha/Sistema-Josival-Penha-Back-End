// Importações
    const express = require('express')
    const fotos = express.Router()
    const aws = require('aws-sdk')
    const s3 = new aws.S3()
    const fs = require('fs')
    const path = require('path')
    // Models
        const alunosModels = require('../../../models/aluno')
        const turmasModels = require('../../../models/turma')
    // Config

// Rotas solo
    fotos.get('/', async (req, res) => {
        s3.listObjects({
            Bucket: process.env.AWS_NAME_BUCKET
        }, async (err, resu) => {
            const { Contents: fotosBrutas } = resu

            const fotosSemFilter = await Promise.all(
                fotosBrutas.map(async foto => {
                    if (foto.Key != 'alunos/' && foto.Key != 'alunos/fotos/') {
                        const aluno = await alunosModels.findOne({'foto.key': foto.Key})
                        
                        foto.used = aluno ? true : false
                        foto.url = `https://${process.env.AWS_NAME_BUCKET}.s3.amazonaws.com/${foto.Key}`
                        foto.fileName = foto.Key.split('/')[foto.Key.split('/').length-1]

                        return foto
                    }
                })
            )

            const fotos = fotosSemFilter.filter(foto => foto)
            
            res.json(fotos)
        })
    })

    fotos.delete('/', async (req, res) => {
        const { key } = req.body

        const aluno = await alunosModels.findOne({'foto.key': key})

        if (aluno) {
            aluno.foto = {
                nome: 'Padrão.jpg',
                key: 'Padrão.jpg',
                tamanho: Number(fs.statSync(path.resolve(__dirname, '..', '..', '..', 'public', 'Padrão.jpg')).size),
                tipo: 'image/jpeg',
                url: `${process.env.DOMINIO}/public/Padrão.jpg`,
                width: 500,
                height: 500
            }

            aluno.save()
        }
        
        s3.deleteObject({
            Bucket: process.env.AWS_NAME_BUCKET,
            Key: key
        }, (error, data) => {
            if (error) {
                res.json({error})
            } else {
                res.json({deleted: true})
            }
        })
    })
// Exportações
    module.exports = fotos