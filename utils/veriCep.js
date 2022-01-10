const cepPromise = require('cep-promise')

module.exports = async function veriCep (cep='') {
    try {
        const enderecoBruto = await cepPromise(String(cep))
        const endereco = {
            cidade: enderecoBruto.city,
            bairro: enderecoBruto.neighborhood,
            rua: enderecoBruto.street
        }
        
        return endereco
    } catch {
        return false
    }
}