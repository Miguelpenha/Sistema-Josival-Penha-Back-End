const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const fs = require('fs')
const multerS3 = require('multer-s3')

const aws = require('aws-sdk')

const storageS3 = new aws.S3()

const storagesTypes = {
    local: multer.diskStorage({
        destination:(req, file, cb) => {
            cb(null, path.resolve(__dirname, '..', '..', '..', 'public', 'alunos', 'fotos'))
        },
        filename: (req, file, cb) => {
            function gerarHash() {
                let hash = crypto.randomBytes(4).toString('hex')
                if (fs.readdirSync(path.resolve(__dirname, '..', '..', '..', 'public', 'alunos', 'fotos')).includes(`${hash}-${file.originalname}`)) {
                    gerarHash()
                } else {
                    return hash
                }
            }
            file.key = `${gerarHash()}-${file.originalname.replace(/\s+/g, '-')}`
            
            cb(null, file.key)
        }
    }),
    s3: multerS3({
        s3: storageS3,
        bucket: process.env.AWS_NAME_BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (req, file, cb) => {
            const fileName = `alunos/fotos/${crypto.randomBytes(4).toString('hex')}-${file.originalname.replace(/\s+/g, '-')}`

            cb(null, fileName)
        },
        serverSideEncryption: 'AES256'
    })
}

module.exports = {
    dest: path.resolve(__dirname, '..', '..', '..', 'public', 'alunos', 'fotos'),
    storage: storagesTypes[process.env.ARMAZENAMENTO],
    limits: {
        fileSize: 100 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        const mimes = [
            'image/png', 
            'image/jpeg', 
            'image/bmp', 
            'image/webp',
            'image/gif',
            'image/psd',
            'image/tiff',
            'image/jp2',
            'image/iff',
            'image/vnd.wap.wbmp',
            'image/xbm',
            'image/vnd.microsoft.icon',
            'image/cis-cod',
            'image/ief',
            'image/pipeg',
            'image/svg+xml',
            'image/x-cmu-raster',
            'image/x-cmx',
            'image/x-icon',
            'image/x-portable-anymap',
            'image/x-portable-bitmap',
            'image/x-portable-graymap',
            'image/x-portable-pixmap',
            'image/x-rgb',
            'image/x-xbitmap',
            'image/x-xpixmap',
            'image/x-xwindowdump',
            'application/x-shockwave-flash',
            'application/octet-stream'
        ]

        if (mimes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(false)
        }
    }
}