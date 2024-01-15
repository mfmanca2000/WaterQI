function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}

function formatDateTime(date) {
    //console.log(date)
    if (date && typeof (date) === 'object') {
        return [
            padTo2Digits(date.getDate()),
            padTo2Digits(date.getMonth() + 1),
            date.getFullYear(),
        ].join('/') + ' ' +
            [padTo2Digits(date.getHours()),
            padTo2Digits(date.getMinutes()),
                //padTo2Digits(date.getSeconds())
            ].join(':');
    }
}

function removeTimeZone(date) {
    if (date && typeof (date) === 'object') {

        const ret = [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate())
        ].join('-') + 'T' +
            [padTo2Digits(date.getHours()),
            padTo2Digits(date.getMinutes()),
                //padTo2Digits(date.getSeconds())
            ].join(':');
        console.log('Datetime is: ' + ret);
        return ret;
    }    
}


export {
    formatDateTime,
    padTo2Digits,
    removeTimeZone
}