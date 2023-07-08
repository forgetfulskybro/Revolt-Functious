function colors(altColorChar, textToTranslate) {
    const colorMap = {
        [`${altColorChar}0`]: '\x1b[30m',   // Black
        [`${altColorChar}1`]: '\x1b[34m',   // Dark Blue
        [`${altColorChar}2`]: '\x1b[32m',   // Dark Green
        [`${altColorChar}3`]: '\x1b[36m',   // Dark Aqua
        [`${altColorChar}4`]: '\x1b[31m',   // Dark Red
        [`${altColorChar}5`]: '\x1b[35m',   // Dark Purple
        [`${altColorChar}6`]: '\x1b[33m',   // Gold
        [`${altColorChar}7`]: '\x1b[37m',   // Gray
        [`${altColorChar}8`]: '\x1b[90m',   // Dark Gray
        [`${altColorChar}9`]: '\x1b[94m',   // Blue
        [`${altColorChar}a`]: '\x1b[92m',   // Green
        [`${altColorChar}b`]: '\x1b[96m',   // Aqua
        [`${altColorChar}c`]: '\x1b[91m',   // Red
        [`${altColorChar}d`]: '\x1b[95m',   // Light Purple
        [`${altColorChar}e`]: '\x1b[93m',   // Yellow
        [`${altColorChar}f`]: '\x1b[97m',   // White
        [`${altColorChar}r`]: '\x1b[0m',    // Reset
    };

    const regex = new RegExp(`${altColorChar}([0-9a-fr])`, 'g');
    return textToTranslate.replace(regex, (match, code) => colorMap[`${altColorChar}${code}`] || '');
};

module.exports = colors;
