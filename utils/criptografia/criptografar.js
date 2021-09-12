const crypto = require('crypto')

module.exports = function criptografar(dado='') {
    if (!dado) {
        return undefined
    } else {
        const iv = crypto.randomBytes(12)
        const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(process.env.SECRET_KEY_CRYPTO), iv)
        let crip = cipher.update(dado, 'utf8', 'hex')
        crip += cipher.final('hex')
        const tag = cipher.getAuthTag().toString('hex')
        return String(`${crip}:${iv.toString('hex')}:${tag}`)
    }
}