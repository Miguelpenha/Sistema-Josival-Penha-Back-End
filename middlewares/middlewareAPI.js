module.exports = function middlewareAPI(req, res, next) {
    const keyBruta = req.header('Authorization') || req.body.keyapi

    if (keyBruta) {
        const key = keyBruta.replace('key ', '')
        const keysAuthorizeds = process.env.API_KEYS_AUTHORIZED.split(',')
        
        if (keysAuthorizeds.includes(key)) {
            next()
        } else {
            res.status(401)
            res.json({'unauthorized': true})
        }
    } else {
        res.status(401)
        res.json({'unauthorized': true})
    }
}