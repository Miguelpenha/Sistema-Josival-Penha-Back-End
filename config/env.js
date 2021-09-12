if (process.env.NODE_ENV == 'production') {
    console.log('Usando o váriaveis de ambiente de produção')
} else {
    console.log('Usando o arquivo .env')
}