// Importações
    const express = require('express')
    const categoriasGastos = express.Router()
    const dinero = require('dinero.js')
    const mongoose = require('mongoose')
    // Middlewares

    // Models
        const gastosModels = require('../../../../models/financeiro/despesas')
        const categoriasGastosModels = require('../../../../models/financeiro/despesas/categorias')
    // Utils
        const dataUtil = require('../../../../utils/data')
// Config
    // Dinero
        dinero.globalLocale = 'pt-br'
// Grupos de rotas
    
// Rotas solo
    categoriasGastos.get('/', async (req, res) => {
        const categorias = await categoriasGastosModels.find({})
        res.json(categorias)
    })

    categoriasGastos.delete('/:id', async (req, res) => {
        if (mongoose.isValidObjectId(req.params.id)) {
            const categoria = await categoriasGastosModels.findById(req.params.id)
            if (categoria) {
                if (categoria.permanent === false) {
                    categoria.deleteOne()
                    res.json({deleted: true})
                } else {
                    res.json({permitted: false})
                }
            } else {
                res.json({exists: false})
            }
        } else {
            res.json({exists: false})
        }
    })
// Exportações
    module.exports = categoriasGastos