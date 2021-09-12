if (process.env.NODE_ENV == 'production') {
    module.exports = {urlMongo: process.env.URL_MONGO_PRODUCAO}
    console.log('Usando o banco de dados de produção')
} else {
    module.exports = {urlMongo: process.env.URL_MONGO_TESTE}
    console.log('Usando o banco de dados de teste')
}