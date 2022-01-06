const express = require('express')
const emails = express.Router()
const mongoose = require('mongoose')
const alunosModels = require('../../models/aluno')
const fs = require('fs')
const path = require('path')
const handlebars = require('handlebars')
const sendGrid = require('@sendgrid/mail')

emails.post('/responsible', async (req, res) => {
    let { id, msg, attachments } = req.body

    if (mongoose.isValidObjectId(id)) {
        const aluno = await alunosModels.findById(id)
        
        if (aluno) {
            const viewEmail = fs.readFileSync(path.resolve(__dirname, '..', '..', 'views', 'emails', 'responsible.handlebars')).toString()
            const templateEmail = handlebars.compile(viewEmail)
            const htmlEmail = templateEmail({
                msg: msg.replaceAll(/\n/g, '<br>'),
                attachments
            })
            
            sendGrid.send({
                to: aluno.email,
                from: process.env.SENDGRID_EMAIL,
                subject: 'Aviso do Instituto Educacional Josival Penha',
                html: htmlEmail
            })
            .then(() => res.json({ send: true }))
            .catch(error => res.json({ send: false, error }))
        } else {
            res.json({exists: false})
        }
    } else {
        res.json({exists: false})
    }
})

module.exports = emails 