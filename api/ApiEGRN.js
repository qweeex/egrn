const axios = require('axios')
const readXlsxFile = require('read-excel-file/node')

class ApiEGRN {

    delay(){
        return new Promise((resolve => setTimeout(resolve, 1000)))
    }

    async RequestAPI(method, params = [], token = '7QGX-VJGJ-ZZUY-55FK'){
        await this.delay()
        return new Promise(async (resolve, reject) => {
            try {
                const data = new URLSearchParams();
                for (const [key, value] of Object.entries(params)) {
                    data.append(key, value)
                }
                const res = await axios.post('https://apiegrn.ru/api/' + method.toLowerCase(), data, {
                    headers: {
                        "Token": token
                    }
                })
                resolve(res.data)
            } catch (e) {
                console.log(e.response)
                reject(e)
            }
        })
    }

    async Init(path){
        try {
            await readXlsxFile(path).then((rows) => {
                for (let item in rows){
                    console.table(item[3])
                }
            })
        } catch (e) {
            console.log('Err read file', e)
        }
    }

}

module.exports = new ApiEGRN()