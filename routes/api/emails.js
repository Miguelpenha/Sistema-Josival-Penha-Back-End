const express = require('express')
const emails = express.Router()
const mongoose = require('mongoose')
const alunosModels = require('../../models/aluno')
const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars')
const markDown = require('markdown-it')({
    html: true,
    breaks: true,
    typographer: true
})
const sendGrid = require('@sendgrid/mail')

emails.post('/responsible', async (req, res) => {
    let { id, msg } = req.body

    if (mongoose.isValidObjectId(id)) {
        const aluno = await alunosModels.findById(id)
        
        if (aluno) {
            const viewEmail = fs.readFileSync(path.resolve(__dirname, '..', '..', 'views', 'emails', 'responsible.handlebars')).toString()
            const templateEmail = handlebars.compile(viewEmail)
            const HTMLEmail = templateEmail({ msg: markDown.render(msg) })

            sendGrid.send({
                to: aluno.email,
                from: process.env.SENDGRID_EMAIL,
                subject: 'Aviso do Instituto Educacional Josival Penha',
                html: HTMLEmail
            }).then(() => res.json({send: true})).catch(err => res.json({send: false}))
        } else {
            res.json({exists: false})
        }
    } else {
        res.json({exists: false})
    }
})

module.exports = emails 