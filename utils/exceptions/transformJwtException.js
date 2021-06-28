const {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} = require('jsonwebtoken');
const {
  UnauthorizedException,
} = require('./userFacingExceptions');

/**
 * parses the exception thrown by jwt and throws a userFacingException
 * @param {Object} error
 * @param {string} message
 */
function transformJwtException(error, message) {
  if (error instanceof JsonWebTokenError) {
    throw new UnauthorizedException(message || 'Token validation error');
  }
  if (error instanceof NotBeforeError) {
    throw new UnauthorizedException(message || 'Token not before error');
  }
  if (error instanceof TokenExpiredError) {
    throw new UnauthorizedException(message || 'Token expired');
  }
  throw error;
}

module.exports = transformJwtException;
