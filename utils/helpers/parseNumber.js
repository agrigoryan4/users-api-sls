/**
 * returns either parsed integer or null, if the argument is not parsable to int
 * @param {any} number
 * @returns {number|Array}
 */
function isNumber(number) {
  const parsedInt = parseInt(number);
  return Number.isNaN(parsedInt) ? null : parsedInt;
}

module.exports = isNumber;
