const UserFacingException = require('./UserFacingException');

module.exports = class ValidationException extends UserFacingException {
  constructor(message) {
    super(message, 'Validation Error', 400);
  }
};
