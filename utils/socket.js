let socket = require('socket.io')
let io = null

exports.io = () => {
  return io
}

exports.start = (server) => {
  return io = socket(server, {
    transports: ['websocket']
  })
}