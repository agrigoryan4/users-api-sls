const Joi = require('joi');

const schema = Joi.object({
  id: Joi.string(),
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30),
  password: Joi.string()
    .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
  repeatPassword: Joi.ref('password'),
});

module.exports = schema;
