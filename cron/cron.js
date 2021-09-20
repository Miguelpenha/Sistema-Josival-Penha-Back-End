const cron = require('node-cron')
const fs = require('fs')
const path = require('path')

const tarefas = fs.readdirSync(path.resolve(__dirname, 'tarefas'))
tarefas.map(nomeArq => {
    const tarefa = require(`./tarefas/${nomeArq}`)
    if (tarefa.exec) {
        tarefa()
    }
    if (tarefa.tempo) {
        cron.schedule(tarefa.tempo, tarefa)
    } else {
        cron.schedule('* * * * * *', tarefa)
    }
})