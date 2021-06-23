const UserFacingException = require('./UserFacingException');

module.exports = class ForbiddenException extends UserFacingException {
  constructor(message) {
    super(message, 'Forbidden', 403);
  }
};
