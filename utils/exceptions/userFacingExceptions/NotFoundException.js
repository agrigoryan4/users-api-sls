const UserFacingException = require('./UserFacingException');

module.exports = class NotFoundException extends UserFacingException {
  constructor(message) {
    super(message, 'Not found', 404);
  }
};
