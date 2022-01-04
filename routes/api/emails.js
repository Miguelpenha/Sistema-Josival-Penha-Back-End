const express = require('express')
const emails = express.Router()
const mongoose = require('mongoose')
const alunosModels = require('../../models/aluno')
const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars')
const markDown = require('markdown-it')({
    html: true
})

emails.post('/responsible', async (req, res) => {
    const { id, msg } = req.body

    if (mongoose.isValidObjectId(id)) {
        const aluno = await alunosModels.findById(id)

        if (aluno) {
            const viewEmail = fs.readFileSync(path.resolve(__dirname, '..', '..', 'views', 'emails', 'responsible.handlebars')).toString()
            const templateEmail = handlebars.compile(viewEmail)
            const HTMLEmail = templateEmail({ msg: markDown.render(msg) })
            /*sendGrid.send({
                to: process.env.SENDGRID_EMAIL,
                from: process.env.SENDGRID_EMAIL,
                subject: 'Aviso do Instituto Educacional Josival Penha',
                html: HTMLEmail
            }).then(() => {
                sendEmail = true
            }).catch(err => {
                sendEmail = false
            })*/
            console.log(HTMLEmail)
            res.send(HTMLEmail)
        } else {
            res.json({exists: false})
        }
    } else {
        res.json({exists: false})
    }
})

module.exports = emails 