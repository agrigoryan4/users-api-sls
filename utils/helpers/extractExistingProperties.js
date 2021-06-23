/**
 * extracts desired primitive-value properties from an object, skips those that are not found
 * @param {Object} object
 * @param {string[]} properties
 * @returns {Object}
 */
function extractExistingProperties(object, properties) {
  const derivedObject = {};
  if (!(properties?.length > 0)) return derivedObject;
  properties.forEach((prop) => {
    if (Object.prototype.hasOwnProperty.call(object, prop)) {
      derivedObject[prop] = object[prop];
    }
  });
  return derivedObject;
}

module.exports = extractExistingProperties;
