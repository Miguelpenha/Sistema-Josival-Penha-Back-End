// Importações
    const localStrategy = require('passport-local').Strategy
    console.log('Usando o auth')
// Exportações
    module.exports = passport => {
        passport.use(new localStrategy({usernameField: 'login', passwordField: 'senha'}, (login, senha, done) => {
            if (String(login) !== String(process.env.LOGIN)) {
                return done(null, false, {message: 'Login inválido'})
            } else if (String(senha) !== String(process.env.PASSWORD)){
                return done(null, false, {message: 'Senha inválida'})
            } else {
                return done(null, true, {message: 'Login feito com sucesso'})
            }
        }))

        passport.serializeUser((user, done) => {
            done(null, true)
        })

        passport.deserializeUser((user, done) => {
            done(null, true)
        })
    }