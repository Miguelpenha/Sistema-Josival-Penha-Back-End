// Importações
    const express = require('express')
    const fotos = express.Router()
    const mongoose = require('mongoose')
    const aws = require('aws-sdk')
    const s3 = new aws.S3()
    // Models
        const alunosModels = require('../../../models/aluno')
        const turmasModels = require('../../../models/turma')
    // Config

// Rotas solo
    fotos.get('/', async (req, res) => {
        s3.listObjects({
            Bucket: process.env.AWS_NAME_BUCKET
        }, (err, resu) => {
            const { Contents: fotosBrutas } = resu
            const fotos = []

            fotosBrutas.map(foto => {
                if (foto.Key != 'alunos/' && foto.Key != 'alunos/fotos/') {
                    fotos.push(foto)
                }
            })

            res.json(fotos)
        })
    })

    fotos.delete('/', async (req, res) => {
        const { key } = req.body
        
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