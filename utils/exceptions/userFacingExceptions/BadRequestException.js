const UserFacingException = require('./UserFacingException');

module.exports = class BadRequestException extends UserFacingException {
  constructor(message) {
    super(message, 'Bad Request', 400);
  }
};
