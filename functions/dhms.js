function dhms(str, sec = false) {
    const x = sec ? 1 : 1000;
    if (typeof str !== 'string') return 0;
    const fixed = str.replace(/\s/g, '');
    const tail = +fixed.match(/-?\d+$/g) || 0;
    const parts = (fixed.match(/-?\d+[^-0-9]+/g) || [])
        .map(v => +v.replace(/[^-0-9]+/g, '') * ({ s: x, m: 60 * x, h: 3600 * x, d: 86400 * x }[v.replace(/[-0-9]+/g, '')] || 0));
    return [tail, ...parts].reduce((a, b) => a + b, 0);
};

module.exports = dhms;