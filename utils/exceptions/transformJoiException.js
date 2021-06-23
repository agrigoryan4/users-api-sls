const {
  ValidationException,
} = require('./userFacingExceptions');

/**
 * parses the exception thrown by joi and throws a userFacingException
 * @param {Object} error
 * @param {string} message
 */
function transformJoiException(error, message) {
  if (error.isJoi) {
    const joiMessages = error.details.map((detail) => detail.message);
    const errorMessage = `${(message || 'Validation error')}:  ${joiMessages.join('; ')}`;
    throw new ValidationException(errorMessage);
  } else {
    throw error;
  }
}

module.exports = transformJoiException;
