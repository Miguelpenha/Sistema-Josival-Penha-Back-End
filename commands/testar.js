const fs = require('fs')
const path = require('path')

fs.rmSync(path.resolve(__dirname, '../artillery.json'))

fs.renameSync(path.resolve(__dirname, '../artillery.html'), path.resolve(__dirname, '../report artillery.html'))