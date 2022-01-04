module.exports = function replaceAll(text, replacer, substitute) {
    return text.replace(new RegExp(replacer.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'), 'g'), substitute)
}