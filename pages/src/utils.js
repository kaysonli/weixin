export default {
    dateFormat(value, format) {
        var year = value.getFullYear();
        var month = value.getMonth() + 1;
        var date = value.getDate();
        var hour = value.getHours();
        var minute = value.getMinutes();
        var second = value.getSeconds();
        return format.replace(/Y/, year).replace(/m/, month).replace(/d/, date).replace(/hh/, hour)
            .replace(/H/, hour).replace(/i/, minute).replace(/s/, second);
    }
}