const ApiEGRN = require('./api/ApiEGRN')


/* Заказываемый документ
 XZP  - Отчет об основных параметрах объекта недвижимости
 SOPP - Отчет об изменениях прав на объект недвижимости
 SKS - Отчет об установлении и/или изменении кадастровой стоимости объекта недвижимости
 KPT  - Отчет об объектах недвижимости в пределах кадастрового плана территории*/
const Init = async (docType = 'XZP', payType = 'free') => {
    try {
        console.log('------------------------------------------');
        console.log('Старт работы')
        console.log('1 этап:  делаем запрос по кадастровому номеру')
        await ApiEGRN.RequestAPI('cadaster/objectInfoFull', {
            'query': '64:48:040406:7929'
        }).then(async (res) => {
            if (res.error.code){
                console.log(`Произошла ошибка - : Code: ${res.error.code}, ${res.error.mess}`)
                return;
            }
            if (res.documents[docType].available === false){
                console.log('На данный объект недвижимости невозможно заказать документ - ', docType);
                return;
            } else {
                console.log('Документ доступен для заказа')
            }
            console.log('2 этап: Оформляем заказ документа')
            await ApiEGRN.RequestAPI('Cadaster/Save_order', {
                'encoded_object': res.encoded_object,
                'documents': docType,
                'comment': 'тестовый заказ'
            }).then(async (doc) => {
                if (doc.paid === false){
                    console.log(`Заказ оформлен и передан в обработку. Номер заказа ${doc.transaction_id}, номер документа в заказе ${doc.documents_id[docType]}`);
                }
                console.log('Если заказ ожидает оплаты, т.е. если тариф у нас "Базовый" ')
                console.log('# Пытаемся оплатить с лицевого счета')
                console.log('3 этап: Получаем перечень всех возможных способов оплаты')
                await ApiEGRN.RequestAPI('Transaction/info', {
                    'id': doc.transaction_id
                }).then(async (trans) => {
                    switch (payType) {
                        case 'PA':
                            console.log('Проводим оплату с лицевого счета')
                            if (trans['pay_methods']['PA']['allowed'] === true){
                                if (trans['pay_methods']['PA']['sufficient_funds'] === true){
                                    console.log("Подтверждаем оплату")
                                    await ApiEGRN.RequestAPI('Transaction/pay', {
                                        'id': doc.transaction_id,
                                        'confirm': trans['pay_methods']['PA']['confirm_code']
                                    }).then(async (pay) => {
                                        if (pay.paid === true){
                                            console.log(`Заказ оплачен и передан в обработку. Номер заказа ${doc.transaction_id}, , номер документа в заказе ${doc.documents_id[docType]}`);
                                        } else {
                                            console.log('Не удалось оплатить заказ')
                                        }
                                    })
                                } else {
                                    console.log('Недостаточно средств на лицевом счете. Воспользуйтесь другими способами оплаты.')
                                }
                            } else {
                                console.log('Оплата  не допускается для этого заказа.')
                            }
                            break;
                        case 'free':
                            console.log('Проводим бесплатно')
                            if (trans['pay_methods']['free']['allowed'] === true){
                                if (trans['pay_methods']['free']['confirm_code']){
                                    console.log("Подтверждаем оплату")
                                    await ApiEGRN.RequestAPI('Transaction/pay', {
                                        'id': doc.transaction_id,
                                        'confirm': trans['pay_methods']['free']['confirm_code']
                                    }).then(async (pay) => {
                                        if (pay.paid === true){
                                            console.log(`Заказ оплачен и передан в обработку. Номер заказа ${doc.transaction_id}, , номер документа в заказе ${doc.documents_id[docType]}`);
                                        } else {
                                            console.log('Не удалось оплатить заказ')
                                        }
                                    })
                                } else {
                                    console.log('Недостаточно средств на лицевом счете. Воспользуйтесь другими способами оплаты.')
                                }
                            } else {
                                console.log('Оплата  не допускается для этого заказа.')
                            }
                    }


                })
            })
        })

    } catch (e) {
        console.log('Err: ', e)
    }
}

Init()

