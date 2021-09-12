module.exports = () => {
    const data = new Date().toLocaleDateString('pt-br')
    return data
}

module.exports.hora = () => {
    const hora = new Date().toLocaleTimeString('pt-br').split(':')
    return `${hora[0]}:${hora[1]}`
}

module.exports.hora.completa = () => {
    const hora = new Date().toLocaleTimeString('pt-br')
    return hora
}

module.exports.completa = (dataBruta=undefined) => {
    return dataBruta ? new Date(dataBruta) : new Date()
}

module.exports.input = () => {
    const data = new Date().toLocaleDateString('pt-br')
    return `${data.split('/')[2]}-${data.split('/')[1]}-${data.split('/')[0]}`
}

module.exports.converter = {
    inputParaData: dataBruta => {
        const dataSepa = String(dataBruta).split('-')
        return `${dataSepa[2]}/${dataSepa[1]}/${dataSepa[0]}`
    },
    dataParaInput: dataBruta => {
        const dataSepa = String(dataBruta).split('/')
        return `${dataSepa[2]}-${dataSepa[1]}-${dataSepa[0]}`
    },
    pagamentoParaData: dataBruta => {
        const dataSepa = String(dataBruta).split('-')
        const data = `${dataSepa[1]}/${dataSepa[2]}/${dataSepa[0]}`
        return new Date(data)
    }
}