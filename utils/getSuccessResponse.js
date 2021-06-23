module.exports = function getSuccessResponse(result, statusCode) {
	const { Items, LastEvaluatedKey } = result;
	const response = {
		statusCode: statusCode || 200,
	};
	const responseBody = {
		data: Items || null,
	};
	if(LastEvaluatedKey) {
		responseBody._meta = {
			pagination: {
				LastEvaluatedKey: LastEvaluatedKey,
			},
		};
	}
	response.body = JSON.stringify(responseBody);
	return response;
};
