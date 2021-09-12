module.exports = (req, res, next) => {
    if (req.query.voltar == undefined) {
        req.voltar = false
    } else {
        req.voltar = req.query.voltar
    }
    next()
}