const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const fs = require('fs')

module.exports = {
    dest: path.resolve(__dirname, '..', '..', '..', 'public', 'exportações'),
    storage: multer.diskStorage({
        destination:(req, file, cb) => {
            cb(null, path.resolve(__dirname, '..', '..', '..', 'public', 'exportações'))
        },
        filename: (req, file, cb) => {
            function gerarHash() {
                let hash = crypto.randomBytes(4).toString('hex')
                if (fs.readdirSync(path.resolve(__dirname, '..', '..', '..', 'public', 'exportações')).includes(`${hash}-${file.originalname}`)) {
                    gerarHash()
                } else {
                    return hash
                }
            }
            file.key = `${gerarHash()}-${file.originalname.replace(/\s+/g, '-')}`
            
            cb(null, file.key)
        }
    }),
    limits: {
        fileSize: 10000 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const mimes = [
            'application/json'
        ]
        if (mimes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(false)
        }
    }
}