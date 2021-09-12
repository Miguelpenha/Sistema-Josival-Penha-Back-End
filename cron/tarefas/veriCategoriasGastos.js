const categoriasGastos = require('../../utils/categoriasGastos')
const categoriasGastosModels = require('../../models/financeiro/gastos/categorias')
const data = require('../../utils/data')

module.exports = function veriCategoriasGastos() {
    categoriasGastos.map(async categoriaGasto => {
        const categoria = await categoriasGastosModels.findOne({nome: categoriaGasto.nome})
        if (!categoria) {
            categoriasGastosModels.create({
                nome: categoriaGasto.nome,
                cor: categoriaGasto.cor,
                criacao: {
                    data: data(),
                    hora: data.hora(),
                    sistema: data.completa()
                }
            }).then(() => {

            })
        }
    })
}