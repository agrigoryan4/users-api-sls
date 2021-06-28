const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
// exceptions
const {
	BadRequestException,
	UnauthorizedException
} = require('../utils/exceptions/userFacingExceptions');
const transformJwtException = require('../utils/exceptions/transformJwtException');
// helpers
const getPolicyDocument = require('../utils/getPolicyDocument');
const getErrorResponse = require('../utils/getErrorResponse');
const getSuccessResponse = require('../utils/getSuccessResponse');
// constants
const { USERS_TABLE } = require('../utils/constants/db');
const { JWT_ACCESS_SECRET = 'someSecret' } = process.env;
// db
const dynamoDb = require('../db');

module.exports.authorizer = async (event, context) => {
	try {
		const { headers: { Authorization: AuthorizationHeader } } = event;
		const token = AuthorizationHeader.split(' ')[1];
		let id;
		try {
			({ user: { id } } = await jwt.verify(token, JWT_ACCESS_SECRET));
		} catch (error) {
			transformJwtException(error, 'Unable to identify the user');
		}
		const user = { id };
		const response = getPolicyDocument(true, { principalId: id, user });
		return response;
	} catch(error) {
		const response = getPolicyDocument(false, {});
		return response;
	}
};

module.exports.getToken = async (event, context, callback) => {
	try {
		// extracting user credentials from the body
		const { username, password } = JSON.parse(event.body);
		// validating credentials
		if(!username || !password) {
			throw new BadRequestException();
		}
		// checking credentials
		const params = {
			'TableName': USERS_TABLE,
			'IndexName': 'usernameIndex',
			'KeyConditionExpression': 'username = :username',
			'ExpressionAttributeValues': {
				':username': username,
			},
			'ProjectionExpression': 'id, username, password',
		};
		const result = await dynamoDb.query(params).promise();
		const { Items: [ user ] } = result;
		if(!user) {
			throw new UnauthorizedException('Invalid credentials');
		}
		const passwordMatch = await bcrypt.compare(password, user.password);
		if(!passwordMatch) {
			throw new UnauthorizedException('Invalid credentials');
		}
		// creating jwt token
		const tokenPayload = {
			user: {
				id: user.id,
			},
		};
		const token = await jwt.sign(tokenPayload, JWT_ACCESS_SECRET);
		const response = getSuccessResponse({ Token: token });
		return response;
	} catch(error) {
		const response = getErrorResponse(error);
		return response;
	}
};
