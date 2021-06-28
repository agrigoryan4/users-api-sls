module.exports = function getSuccessResponse(result, statusCode) {
	const { Items, LastEvaluatedKey, Token } = result;
	const response = {
		statusCode: statusCode || 200,
	};
	const responseBody = {
		data: Items || {},
	};
	if(LastEvaluatedKey) {
		responseBody._meta = {
			pagination: {
				LastEvaluatedKey: LastEvaluatedKey,
			},
		};
	}
	if(Token) {
		responseBody.data.Token = Token;
	}
	response.body = JSON.stringify(responseBody);
	return response;
};
