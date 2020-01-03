const filter = (data) => {
    for (let key in data) {
        /_/.test(key) && delete data[key]
    }

    return data
}

module.exports = {
    filter
}
