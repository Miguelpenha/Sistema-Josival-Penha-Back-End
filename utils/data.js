module.exports = () => new Date().toLocaleDateString('pt-br')

module.exports.hora = () => {
    const hora = new Date().toLocaleTimeString('pt-br').split(':')
    return `${hora[0]}:${hora[1]}`
}

module.exports.hora.completa = () => new Date().toLocaleTimeString('pt-br')

module.exports.completa = (dataBruta=undefined) => dataBruta ? new Date(dataBruta) : new Date()

module.exports.input = () => {
    const data = new Date().toLocaleDateString('pt-br')
    return `${data.split('/')[2]}-${data.split('/')[1]}-${data.split('/')[0]}`
}

module.exports.getMes = (mes='') => {
    if (mes === '01') {
        return 'janeiro'
    } else if (mes === '02') {
        return 'fevereiro'
    } else if (mes === '03') {
        return 'março'
    } else if (mes === '04') {
        return 'abril'
    } else if (mes === '05') {
        return 'maio'
    } else if (mes === '06') {
        return 'junho'
    } else if (mes === '07') {
        return 'julho'
    } else if (mes === '08') {
        return 'agosto'
    } else if (mes === '09') {
        return 'setembro'
    } else if (mes === '10') {
        return 'outubro'
    } else if (mes === '11') {
        return 'novembro'
    } else if (mes === '12') {
        return 'dezembro'
    }
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
    dataParaDate: dataBruta => {
        const dataSepa = String(dataBruta).split('/')
        const data = `${dataSepa[2]}-${dataSepa[1]}-${dataSepa[0]}`
        return new Date(data)
    }
}