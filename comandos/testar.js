const port = require('../config/port').port
const shellJs = require('shelljs')

const users = 20
const reqs = 200

shellJs.exec(`artillery quick --count ${users} -n ${reqs} http://localhost:${port}`).stdout