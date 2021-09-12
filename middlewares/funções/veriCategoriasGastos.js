const categoriasGastosModels = require('../../models/financeiro/gastos/categorias')
const categoriasGastos = require('../../utils/categoriasGastos')
const data = require('../../utils/data')

module.exports = (req, res, next) => {
    categoriasGastos.forEach(async categoriaPd => {
        const categoria = await categoriasGastosModels.findOne({
            nome: categoriaPd.nome
        })
        if (!categoria) {
            categoriasGastosModels.create({
                nome: categoriaPd.nome,
                cor: categoriaPd.cor,
                criacao: {
                    data: data(),
                    hora: data.hora(),
                    sistema: data.completa()
                }
            }).then(() => {
                
            })
        }
    })
    
    next()
}