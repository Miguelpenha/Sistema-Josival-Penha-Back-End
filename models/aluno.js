const mongoose = require('mongoose')
const turmasModels = require('./turma')
const aws = require('aws-sdk')
const s3 = new aws.S3()
const fs = require('fs')
const path = require('path')
const criptografar = require('../utils/criptografia/criptografar')
const descriptografar = require('../utils/criptografia/descriptografar')

const schema = new mongoose.Schema({
    nome: String,
    sexo: String,
    nascimento: String,
    cpf: {
        type: String,
        get: descriptografar,
        set: criptografar
    },
    responsável1: String,
    responsável2: String,
    telefone: String,
    email: String,
    endereço: {
        cep: String,
        cidade: String,
        bairro: String,
        rua: String,
        número: String,
        complemento: String
    },
    matrícula: String,
    turma: String,
    professora: String,
    situação: String,
    observação: String,
    foto: {
        nome: String,
        key: String,
        tamanho: String,
        tipo: String,
        url: String
    },
    criação: {
        data: String,
        hora: String,
        sistema: Date
    }
}, {
    toJSON: {
        getters: true
    }
})

schema.pre('save', async function() {
    const turma = await turmasModels.findById(this.turma).select('alunos')
    turma.alunos = Number(turma.alunos)+1
    turma.save()
    if (this.nascimento === 'undefined/undefined/') {
        this.nascimento = undefined
    }
    if (this.email.length === 0) {
        this.email = undefined
    }
    if (this.endereço.cep.length === 0) {
        this.endereço.cep = undefined
    }
    if (this.endereço.cidade.length === 0) {
        this.endereço.cidade = undefined
    }
    if (this.endereço.bairro.length === 0) {
        this.endereço.bairro = undefined
    }
    if (this.endereço.rua.length === 0) {
        this.endereço.rua = undefined
    }
    if (this.endereço.número.length === 0) {
        this.endereço.número = undefined
    }
    if (this.endereço.complemento.length === 0) {
        this.endereço.complemento = undefined
    }
    if (this.matrícula === 'undefined/undefined/') {
        this.matrícula = undefined
    }
    if (this.situação.length === 0) {
        this.situação = undefined
    }
    if (this.observação.length === 0) {
        this.observação = undefined
    }
    if (this.responsável2.length === 0) {
        this.responsável2 = undefined
    }
    if (!this.foto.url) {
        this.foto.url = `${process.env.DOMINIO}/public/alunos/fotos/${this.foto.key}`
    }
    this.foto.tamanho = (this.foto.tamanho/(1024*1024)).toFixed(2)
})

schema.pre('deleteMany', async function(next) {
    const alunos = await alunosModels.find({turma: this._conditions.turma})
        alunos.forEach(aluno => {
            if (process.env.ARMAZENAMENTO === 's3') {
                s3.deleteObject({
                    Bucket: process.env.AWS_NAME_BUCKET,
                    Key: aluno.foto.key
                }, (err, data) => {
                    
                })
            } else {
                if (aluno.foto.key != 'Padrão.jpg') {
                    fs.unlinkSync(path.resolve(__dirname, '../', 'public', 'alunos', 'fotos', aluno.foto.key))
                }
            }
        })
    next()
})

schema.pre('deleteOne', {document: true}, async function(next) {
    const turma = await turmasModels.findOne({nome: this.turma})
    turma.alunos = Number(turma.alunos)-1
    turma.save()
    if (process.env.ARMAZENAMENTO === 's3') {
        s3.deleteObject({
            Bucket: process.env.AWS_NAME_BUCKET,
            Key: this.foto.key
        }, (err, data) => {
            
        })
    } else {
        if (this.foto.key != 'Padrão.jpg') {
            fs.unlinkSync(path.resolve(__dirname, '../', 'public', 'alunos', 'fotos', this.foto.key))
        }
    }
    next()
})

/*
schema.pre('find', function() {
    this.map(async alunos => {
        if (alunos.length >= 1) {
            await Promise.all(
                alunos.map(async aluno => {
                    aluno.turma = (await turmasModels.findById(aluno.turma)).nome
                    return aluno
                })
            )
        }
        return alunos
    })
})
*/

const alunosModels = mongoose.model('alunos', schema)

module.exports = alunosModels