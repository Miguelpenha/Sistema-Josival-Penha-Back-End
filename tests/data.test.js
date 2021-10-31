const data = require('../utils/data')

describe('Data()', () => {
    it('data()', () => expect(data()).toBe(new Date().toLocaleDateString('pt-br')))

    it('data.hora()', () => expect(data.hora()).toContain(':'))

    it('data.hora.completa()', () => expect(data.hora.completa()).toBe(new Date().toLocaleTimeString('pt-br')))

    it('data.completa()', () => expect(data.completa(new Date())).toBeDefined())

    it('data.input()', () => expect(data.input()).toContain('-'))

    it('data.getMes()', () => expect(data.getMes(new Date().toLocaleDateString('pt-br').split('/')[1])).toBeDefined())

    describe('Data.converter', () => {
        it('data.converter.inputParaData()', () => {
            const date = new Date().toLocaleDateString().split('/')

            expect(data.converter.inputParaData(`${date[2]}-${date[1]}-${date[0]}`)).toContain(new Date().toLocaleDateString())
        })

        it('data.converter.dataParaInput()', () => expect(data.converter.dataParaInput(new Date().toLocaleDateString())).toContain('-'))

        it('data.converter.dataParaDate()', () => expect(data.converter.dataParaDate(new Date().toLocaleDateString())).toBeDefined())
    })
})