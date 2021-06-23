const UserFacingException = require('./UserFacingException');

module.exports = class UnauthorizedException extends UserFacingException {
  constructor(message) {
    super(message, 'Unauthorized', 401);
  }
};
