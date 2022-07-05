const Api = require('./api/ApiEGRN')

Api('cadaster/objectInfoFull', {
    'query': '64:48:040406:7929'
}).then((res) => {
    console.log('Res:', res)
})
.catch(err => {
    console.log(err)
})