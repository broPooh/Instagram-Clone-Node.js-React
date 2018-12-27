module.exports = function(d) {
    var str =
    d.getFullYear()+'/'+
    getLength(d.getMonth()+1)+'/'+
    getLength(d.getDate())+' at '+
    getLength(d.getHours())+':'+
    getLength(d.getMinutes());
    //getLength(d.getSeconds());
    return str;
}

function getLength(val) {
    if(val < 10) val = '0' + val;
    return val;
}
/*
function getDate(d) {
    var str =
    d.getFullYear()+'/'+
    getLength(d.getMonth()+1)+'/'+
    getLength(d.getDate())+' at '+
    getLength(d.getHours())+':'+
    getLength(d.getMinutes());
    //getLength(d.getSeconds());
    return str;
}

function getLength(val) {
    if(val < 10) val = '0' + val;
    return val;
}*/
