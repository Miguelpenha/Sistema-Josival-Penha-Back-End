const armazenamento = String(process.env.ARMAZENAMENTO)

if (armazenamento === 's3') {
    module.exports = {armazenamento: armazenamento}
    console.log('Usando o armazenamento s3')
} else if (armazenamento === 'local'){
    module.exports = {armazenamento: armazenamento}
    console.log('Usando o armazenamento local')
}