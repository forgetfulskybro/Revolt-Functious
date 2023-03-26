function fetchTime(ms, object = false) {
    var totalSeconds = (ms / 1000);
    let years = Math.floor(totalSeconds / 31536000);
    totalSeconds %= 31536000;
    let days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    seconds = Math.floor(seconds);
    if (object === true) return {
        years,
        days,
        hours,
        minutes,
        seconds
    };

    return `${years ? `${years} year(s),` : ""} ${days ? `${days} day(s),` : ""} ${hours ? `${hours} hour(s),` : ""} ${minutes ? `${minutes} minute(s),` : ""} ${seconds} second(s)`;
}

module.exports = fetchTime; 