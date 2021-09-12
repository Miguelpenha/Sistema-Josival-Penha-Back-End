if (process.env.PORT) {
    module.exports = {port: process.env.PORT}
    console.log('Usando a porta de produção')
} else {
    module.exports = {port: process.env.PORTA}
    console.log('Usando a porta de teste')
}