require('dotenv').config()
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const path = require('path')
const dinero = require('dinero.js')
const sendGrid = require('@sendgrid/mail')
const apiRouter = require('./routes/api')
const urlMongo = require('./config/db').urlMongo
const port = require('./config/port')
// helmet sem funcionar
// app.use(helmet({
//     contentSecurityPolicy: {
//         useDefaults: true,
//         directives: {
//             scriptSrc: ["'self'", "'unsafe-inline'", "www.gstatic.com", "cdnjs.cloudflare.com", "ajax.googleapis.com", "cdn.jsdelivr.net"]
//         }
//     }
// }))
mongoose.connect(urlMongo, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
app.set('trust proxy', 1)
app.disable('x-powered-by')
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use('/public', express.static(path.resolve(__dirname, 'public')))
app.use(morgan('dev'))
app.use(cors({
    origin: process.env.URLS_AUTHORIZED.split(','),
    optionsSuccessStatus: 200
}))

dinero.globalLocale = 'pt-br'
sendGrid.setApiKey(process.env.SENDGRID_API_KEY)

app.use('/api', apiRouter)

app.use((req, res) => {
    res.status(404)
})

app.listen(port, () => console.log('Servidor Rodando'))