const express = require('express')
const administrativo = express.Router()
const { sign, verify, decode } = require('jsonwebtoken')
const sendGrid = require('@sendgrid/mail')
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')

administrativo.post('/login', async (req, res) => {
    const { login, senha } = req.body
    let administrador = login === process.env.LOGIN ? {
        login: process.env.LOGIN
    } : {}

    if (!administrador.login) {
        res.json({userNotFound: true})
    } else {
        if (senha === process.env.PASSWORD) {
            administrador = administrador[0]
            const token = sign({}, process.env.SECRET_JWT, {
                subject: 'true',
                expiresIn: '20s'
            })
            let sendEmail = false
            if (req.body.ult) {
                const viewEmail = fs.readFileSync(path.resolve(__dirname, '../', '../', 'views', 'email.handlebars')).toString()
                const templateEmail = handlebars.compile(viewEmail)
                const HTMLEmail = templateEmail({ infos: req.body.modelUser })
                sendGrid.send({
                    to: process.env.SENDGRID_EMAIL,
                    from: process.env.SENDGRID_EMAIL,
                    subject: 'Novo login detectado na administração',
                    html: HTMLEmail
                }).then(() => {
                    sendEmail = true
                }).catch(err => {
                    sendEmail = false
                })
            }
            res.json({authenticated: true, token, sendEmail})
        } else {
            res.json({authenticated: false})
        }
    }
})

administrativo.post('/auth', async (req, res) => {
    const { token } = req.body
    
    try {
        verify(token, process.env.SECRET_JWT)
        res.json({})
    } catch {
        const newToken = sign({}, process.env.SECRET_JWT, {
            subject: 'true',
            expiresIn: '20s'
        })
        res.json({newToken})
    }
})

administrativo.post('/tokenId', async (req, res) => {
    const { token } = req.body
    if (decode(token)) {
        try {
            verify(token, process.env.SECRET_JWT)
            res.json({id: 'true'})
        } catch {
            res.json({})
        }
    } else {
        res.json({})
    }
})

module.exports = administrativo