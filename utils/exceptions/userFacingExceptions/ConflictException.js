const UserFacingException = require('./UserFacingException');

module.exports = class ConflictException extends UserFacingException {
  constructor(message) {
    super(message, 'Resource Conflict Error', 409);
  }
};
