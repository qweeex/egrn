const axios = require('axios')

module.exports = async (Class, params = [], token = '7QGX-VJGJ-ZZUY-55FK') => {
    return new Promise(async (resolve, reject) => {
        try {
            const data = new URLSearchParams();
            for (const [key, value] of Object.entries(params)) {
                data.append(key, value)
            }
            const res = await axios.post('https://apiegrn.ru/api/' + Class, data, {
                headers: {
                    "Token": token
                }
            })
            resolve(res.data)
        } catch (e) {
            reject(e)
        }
    })
}