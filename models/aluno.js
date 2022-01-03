const mongoose = require('mongoose')
const turmasModels = require('./turma')
const professorasModels = require('./professora')
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
        url: String,
        width: Number,
        height: Number
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

schema.pre('find', function() {
    this.map(async alunos => {
        if (alunos.length >= 1) {
            await Promise.all(
                alunos.map(async aluno => {
                    try {
                        aluno.turma = (await turmasModels.findById(aluno.turma)).nome
                        aluno.professora = (await professorasModels.findById(aluno.professora)).nome
                        return aluno
                    } catch {

                    }
                })
            )
        }
        return alunos
    })
})

const alunosModels = mongoose.model('alunos', schema)

module.exports = alunosModels