// Importações
    require('dotenv').config()
    const express = require('express')
    const app = express()
    const server = require('http').createServer(app)
    const handlebars = require('express-handlebars')
    const mongoose = require('mongoose')
    const morgan = require('morgan')
    const cors = require('cors')
    const session = require('express-session')
    const flash = require('connect-flash')
    const path = require('path')
    const handlebarsOriginal = require('handlebars')
    const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access')
    const passport = require('passport')
    const mongoStore = require('connect-mongo')
    const dinero = require('dinero.js')
    const sendGrid = require('@sendgrid/mail')
    //const helmet = require('helmet')
    // Úteis
        const io = require('./utils/socket').start(server)
        const veriCep = require('./utils/veriCep')
    // Middlewares
        const veriMiddleware = require('./middlewares/middlewares')
    // Routes
        const alunosRouter = require('./routes/alunos')
        const turmasRouter = require('./routes/turmas')
        const professorasRouter = require('./routes/professoras')
        const financeiroRouter = require('./routes/financeiro/financeiro')
        const apiRouter = require('./routes/api/api')
    // Models
        const alunosModels = require('./models/aluno')
        const turmasModels = require('./models/turma')
        const professorasModels = require('./models/professora')
        const gastosModels = require('./models/financeiro/gastos/gastos')
        const categoriasGastosModels = require('./models/financeiro/gastos/categorias')
    // Config
        const urlMongo = require('./config/db').urlMongo
        const port = require('./config/port')
        require('./config/auth')(passport)
        require('./cron/cron')
// Config geral
    // helmet
        // helmet sem funcionar
        // app.use(helmet({
        //     contentSecurityPolicy: {
        //         useDefaults: true,
        //         directives: {
        //             scriptSrc: ["'self'", "'unsafe-inline'", "www.gstatic.com", "cdnjs.cloudflare.com", "ajax.googleapis.com", "cdn.jsdelivr.net"]
        //         }
        //     }
        // }))
    // Proxy
        app.set('trust proxy', 1)
    // Segurança
        app.disable('x-powered-by')
    // Sessão
        app.use(session({
            secret: process.env.SECRET_KEY_SESSION,
            resave: false,
            saveUninitialized: true,
            name: 'sessionId',
            cookie: {
                maxAge: 315360000000000
            },
            store: mongoStore.create({
                mongoUrl: urlMongo, 
                mongoOptions: {
                    useNewUrlParser: true, 
                    useUnifiedTopology: true
                }, 
                ttl: 315360000000000
            })
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    // Middleware
        app.use(veriMiddleware.veriCategoriasGastosModels)
        app.use((req, res, next) => {
            res.locals.erro_msg = req.flash('erro_msg')
            res.locals.sucesso_msg = req.flash('sucesso_msg')
            res.locals.alert_msg = req.flash('alert_msg')
            res.locals.primario_msg = req.flash('primario_msg')
            res.locals.error = req.flash('error')
            res.locals.success = req.flash('success')
            res.locals.logado = req.user || false
            next()
        })
    // Body Parser
        app.use(express.urlencoded({extended: true}))
        app.use(express.json())
    // Express HandleBars
        app.engine('handlebars', handlebars({defaultLayout: 'main', handlebars: allowInsecurePrototypeAccess(handlebarsOriginal), helpers: {
            dominio: process.env.DOMINIO
        }}))
        app.set('view engine', 'handlebars')
    // Mongoose
        mongoose.connect(urlMongo, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    // Public
        app.use('/public', express.static(path.join(__dirname, '/public')))
    // Morgan
        app.use(morgan('dev'))
    // Cors
        app.use(cors({
            origin: process.env.URLS_AUTHORIZED.split(','),
            optionsSuccessStatus: 200
        }))
    // Dinero
        dinero.globalLocale = 'pt-br'
    // SendGrid
        sendGrid.setApiKey(process.env.SENDGRID_API_KEY)
// Grupo de rotas
    app.use('/alunos', alunosRouter)
    app.use('/turmas', turmasRouter)
    app.use('/professoras', professorasRouter)
    app.use('/financeiro', financeiroRouter)
    app.use('/api', apiRouter)
// Rotas solo 
    app.get('/', veriMiddleware.login, veriMiddleware.voltar, async (req, res) => {
        res.render('index')
    })
    
    app.get('/login', (req, res) => {
        if (req.isAuthenticated()) {
            res.redirect('/')
        } else {
            res.render('login')
        }
    })
    
    app.post('/login-veri', (req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/',
            successFlash: true,
            failureRedirect: '/login',
            failureFlash: true
        })(req, res, next)
    })

    app.get('/logout', veriMiddleware.login, veriMiddleware.voltar, (req, res) => {
        if (req.isAuthenticated()) {
            req.logout()
            req.flash('primario_msg', 'Logout feito com sucesso')
            res.redirect('/login')
        } else {
            res.redirect('/login')
        }
    })
// Erro 404
    app.use((req, res) => {
        res.status(404).render('404')
    })
// Socket.io
    io.on('connection', socket => {
        socket.on('alunoNameVeri', nomeAluno => {
            alunosModels.findOne({nome: nomeAluno}, (err, aluno) => {
                if (aluno) {
                    socket.emit('alunoVeri', true)
                } else {
                    socket.emit('alunoVeri', false)
                }
            })
        })

        socket.on('veri-cep-alunos-cadas', async cep => {
            const endereco = await veriCep(cep)
            socket.emit('veri-cep-alunos-cadas-res', endereco)
        })

        socket.on('turmaVeriCadas', nomeSerie => {
            turmasModels.findOne({nome: nomeSerie}, (err, turma) => {
                if (turma) {
                    socket.emit('turmaVeriCadasRes', true)
                } else {
                    socket.emit('turmaVeriCadasRes', false)
                }
            })
        })

        socket.on('gastosVeriCadas', nomeGasto => {
            gastosModels.findOne({nome: nomeGasto}, (err, gasto) => {
                if (gasto) {
                    socket.emit('gastosVeriCadasRes', true)
                } else {
                    socket.emit('gastosVeriCadasRes', false)
                }
            })
        })

        socket.on('professoraVeriCadas', professora => {
            professorasModels.findOne({nome: professora}, (err, professora) => {
                if (professora) {
                    socket.emit('professoraVeriCadasRes', true)
                } else {
                    socket.emit('professoraVeriCadasRes', false)
                }
            })
        })

        socket.on('veri-alunos-alunos', async quant => {
            const alunos = await alunosModels.find({})
            let recarregar = false
            if (quant != alunos.length) {
                recarregar = true
            }
            
            socket.emit('veri-alunos-alunos-res', recarregar)
        })

        socket.on('veri-professoras-professoras', async quant => {
            const professoras = await professorasModels.find({})
            let recarregar = false
            if (quant != professoras.length) {
                recarregar = true
            }
            
            socket.emit('veri-professoras-professoras-res', recarregar)
        })

        socket.on('veri-turmas-turmas', async quant => {
            const turmas = await turmasModels.find({})
            let recarregar = false
            if (quant != turmas.length) {
                recarregar = true
            }
            
            socket.emit('veri-turmas-turmas-res', recarregar)
        })

        socket.on('veri-gastos-gastos', async quant => {
            const gastos = await gastosModels.find({})
            let recarregar = false
            if (quant != gastos.length) {
                recarregar = true
            }
            
            socket.emit('veri-gastos-gastos-res', recarregar)
        })
        
        socket.on('veri-alunos-alunos-pesquisa', async pesquisa => {
            const nomes = (await alunosModels.find({}).select('nome')).map(aluno => aluno.nome)
            let alunosAchados = []
            for (let cont = 0;cont <= nomes.length;cont++) {
                const nome = String(nomes[cont])
                if (nome.toUpperCase().includes(pesquisa.toUpperCase().trim())) {
                    try {
                        alunosAchados.push((await alunosModels.findOne({nome: nome}).select('nome'))._id)
                    } catch {

                    }
                }
            }
            alunosAchados.map((aluno, index) => {
                if (index == alunosAchados.length-1) {
                    aluno.ultimo = true
                }
            })
            if (alunosAchados.length >= 1) {
                socket.emit('veri-alunos-alunos-pesquisa-res', {
                    alunos: alunosAchados,
                    ultimo: alunosAchados.length-1
                })
            } else {
                socket.emit('veri-alunos-alunos-pesquisa-res', false)
            }
        })

        socket.on('veri-gastos-gastos-pesquisa', async pesquisa => {
            const nomes = (await gastosModels.find({}).select('nome')).map(gasto => gasto.nome)
            let gastosAchados = []
            for (let cont = 0;cont <= nomes.length;cont++) {
                const nome = String(nomes[cont])
                if (nome.toUpperCase().includes(pesquisa.toUpperCase().trim())) {
                    try {
                        let gasto = await gastosModels.findOne({nome: nome}).select('nome precoBruto')
                        gastosAchados.push(gasto._id)
                    } catch {

                    }
                }
            }
            gastosAchados.map((gasto, index) => {
                if (index == gastosAchados.length-1) {
                    gasto.ultimo = true
                }
            })
            if (gastosAchados.length >= 1) {
                socket.emit('veri-gastos-gastos-pesquisa-res', {
                    gastos: gastosAchados,
                    ultimo: gastosAchados.length-1
                })
            } else {
                socket.emit('veri-gastos-gastos-pesquisa-res', false)
            }
        })

        socket.on('veri-professoras-professoras-pesquisa', async pesquisa => {
            const nomes = (await professorasModels.find({}).select('nome')).map(professora => professora.nome)
            let professorasAchadas = []
            for (let cont = 0;cont <= nomes.length;cont++) {
                const nome = String(nomes[cont])
                if (nome.toUpperCase().includes(pesquisa.toUpperCase().trim())) {
                    try {
                        professorasAchadas.push((await professorasModels.findOne({nome: nome}).select('nome'))._id)
                    } catch {

                    }
                }
            }
            professorasAchadas.map((professora, index) => {
                if (index == professorasAchadas.length-1) {
                    professora.ultimo = true
                }
            })
            if (professorasAchadas.length >= 1) {
                socket.emit('veri-professoras-professoras-pesquisa-res', {
                    professoras: professorasAchadas,
                    ultimo: professorasAchadas.length-1
                })
            } else {
                socket.emit('veri-professoras-professoras-pesquisa-res', false)
            }
        })

        socket.on('veri-turmas-turmas-pesquisa', async pesquisa => {
            const nomes = (await turmasModels.find({}).select('nome')).map(turma => turma.nome)
            let turmasAchadas = []
            for (let cont = 0;cont <= nomes.length;cont++) {
                const nome = String(nomes[cont])
                if (nome.toUpperCase().includes(pesquisa.toUpperCase().trim())) {
                    try {
                        turmasAchadas.push((await turmasModels.findOne({nome: nome}).select('nome'))._id)
                    } catch {

                    }
                }
            }
            turmasAchadas.map((turma, index) => {
                if (index == turmasAchadas.length-1) {
                    turma.ultimo = true
                }
            })
            if (turmasAchadas.length >= 1) {
                socket.emit('veri-turmas-turmas-pesquisa-res', {
                    turmas: turmasAchadas,
                    ultimo: turmasAchadas.length-1
                })
            } else {
                socket.emit('veri-turmas-turmas-pesquisa-res', false)
            }
        })

        socket.on('veri-grafico-gastos-gastos', async () => {
            const gastosBrutos = await gastosModels.find({}).select('nome precoBruto preco').sort({precoBruto: 'desc'})
            const gastos = []
            gastos.push([
                'Gasto',
                'Preço',
                { role: 'annotation' }
            ])
            gastosBrutos.forEach(gasto => {
                gastos.push([
                    gasto.nome,
                    gasto.precoBruto,
                    gasto.preco
                ])
            })
            socket.emit('veri-grafico-gastos-gastos-res', gastos)
        })

        socket.on('convert-gasto', (maior, menor) => {
            socket.emit('convert-gasto-res', dinero({ amount: maior, currency: 'BRL' }).toFormat(), dinero({ amount: menor, currency: 'BRL' }).toFormat())
        })
        
        socket.on('media-tot-gastos', gastos => {
            gastos.shift()
            let tot = dinero({ amount: 0, currency: 'BRL' })
            gastos.map(gasto => {
                tot = tot.add(dinero({ amount: gasto[1], currency: 'BRL' }))
            })
            let media = tot.divide(gastos.length)
            socket.emit('media-tot-gastos-res', tot.toFormat(), media.toFormat())
        })
        socket.on('veriGastoCategoriasVeri', async quant => {
            const categorias = await categoriasGastosModels.find({})
            if (categorias.length != quant) {
                socket.emit('veriGastoCategoriasVeriRes')
            }
        })
    })
// Config de porta
    server.listen(port, () => {
        console.log('Servidor Rodando')
    })
// Exportações
    module.exports = io