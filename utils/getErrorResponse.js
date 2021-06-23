const UserFacingException = require('../utils/exceptions/userFacingExceptions/UserFacingException');

module.exports = function getErrorResponse(error) {
	let response;
	if (error instanceof UserFacingException) {
		const { statusCode, name, message } = error;
		response = {
			statusCode: statusCode,
			body: JSON.stringify({
				error: {
					name: name,
					message: message,
				},
			}),
		};
	} else {
		response = {
			statusCode: 500,
			body: JSON.stringify({
				error: {
					name: 'Internal Server Error',
				},
			}),
		};
	}
	return response;
};
