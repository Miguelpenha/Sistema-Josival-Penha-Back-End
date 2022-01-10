const mongoose = require('mongoose')
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
    matérias: {
        português: {
            primeira: Number,
            segunda: Number,
            terceira: Number,
            quarta: Number
        },
        inglês: {
            primeira: Number,
            segunda: Number,
            terceira: Number,
            quarta: Number
        },
        matemática: {
            primeira: Number,
            segunda: Number,
            terceira: Number,
            quarta: Number
        },
        história: {
            primeira: Number,
            segunda: Number,
            terceira: Number,
            quarta: Number
        },
        artes: {
            primeira: Number,
            segunda: Number,
            terceira: Number,
            quarta: Number
        },
        ciências: {
            primeira: Number,
            segunda: Number,
            terceira: Number,
            quarta: Number
        },
        geografia: {
            primeira: Number,
            segunda: Number,
            terceira: Number,
            quarta: Number
        },
        religião: {
            primeira: Number,
            segunda: Number,
            terceira: Number,
            quarta: Number
        },
        educaçãoFísica: {
            primeira: Number,
            segunda: Number,
            terceira: Number,
            quarta: Number
        }
    },
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

const alunosModels = mongoose.model('alunos', schema)

module.exports = alunosModels