'use strict';

const AWS = require('aws-sdk');
const uuid = require('uuid');
const bcrypt = require('bcrypt');
// utils
const userValidation = require('../utils/validation/userValidation');
const transformJoiException = require('../utils/exceptions/transformJoiException');
const {
  BadRequestException,
  ConflictException
} = require('../utils/exceptions/userFacingExceptions');
// helpers
const extractExistingProperties = require('../utils/helpers/extractExistingProperties');
const parseNumber = require('../utils/helpers/parseNumber');
const getErrorResponse = require('../utils/getErrorResponse');
const getSuccessResponse = require('../utils/getSuccessResponse');
// constants
const USERS_TABLE = process.env.USERS_TABLE;
const { DEFAULT_LIMIT, DEFAULT_OFFSET } = require('../utils/constants/pagination');

/**/AWS.config.setPromisesDependency(require('bluebird'));

/**/const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.addUser = async (event, context, callback) => {
  try {
    const { username, password, repeatPassword } = JSON.parse(event.body);
    if (!username || !password) {
      throw new BadRequestException();
    }
    const { error } = userValidation.validate({
      username,
      password,
      repeatPassword,
    });
    if (error) {
      transformJoiException(error, 'Invalid data provided for created the user.');
    }
    // checking if username already exists
    const queryParams = {
      TableName: USERS_TABLE,
      IndexName: "usernameIndex",
      KeyConditionExpression: "username = :username",
      ExpressionAttributeValues: {
        ":username": username,
      },
      ProjectionExpression: "id",
    };
    const { Count: alreadyExists } = await dynamoDb.query(queryParams).promise();
    if(alreadyExists)  {
      throw new ConflictException('User with the given username already exists');
    }
    // db
    const encryptedPassword = await bcrypt.hash(password, 12);
    const result = await dynamoDb.put({
      TableName: USERS_TABLE,
      Item: {
        id: uuid.v4(),
        username: username,
        password: encryptedPassword,
      }
    }).promise();
    //
    const response = getSuccessResponse(result, 201);
    return response;
  } catch (error) {
    const response = getErrorResponse(error);
    return response;
  }
};

module.exports.getUsers = async (event, context, callback) => {
  try {
    const { queryStringParameters } = event;
    // pagination params
    let { limit, pointer } = { ...queryStringParameters };
    // filter params
    const { username } = { ...queryStringParameters };
    limit = parseNumber(limit) !== null ? parseNumber(limit) : DEFAULT_LIMIT;
    // db
    const params = {
      TableName: USERS_TABLE,
      ProjectionExpression: 'id, username',
      Limit: limit,
    };
    if(pointer) {
      params.ExclusiveStartKey = {'id': pointer};
    }
    if(username) {
      params.FilterExpression = 'contains(username, :usernamePart)';
      params.ExpressionAttributeValues = {
        ':usernamePart': username,
      };
    }
    const result = await dynamoDb.scan(params).promise();
    const response = getSuccessResponse(result);
    return response;
  } catch(error) {
    const response = getErrorResponse(error);
    return response;
  }
};

module.exports.getUser = async (event, context, callback) => {
  try {
    const { id } = event.pathParameters;
    if (!id) {
      throw new BadRequestException();
    }
    const { error } = userValidation.validate({
      id,
    });
    if (error) {
      transformJoiException(error, 'Invalid user id');
    }
    const params = {
      TableName: USERS_TABLE,
      KeyConditionExpression: 'id = :id',
      ExpressionAttributeValues: {
        ':id': id,
      },
      ProjectionExpression: 'id, username',
    };
    const result = await dynamoDb.query(params).promise();
    const response = getSuccessResponse(result);
    return response;
  } catch (error) {
    const response = getErrorResponse(error);
    return response;
  }
};

module.exports.deleteUser = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { id } = requestBody;
    const params = {
      TableName: USERS_TABLE,
      Key: {'id': id},
    };
    const result = await dynamoDb.delete(params).promise();
    const response = getSuccessResponse(result);
    return response;
  } catch(error) {
    const response = getErrorResponse(error);
    return response;
  }
};

module.exports.editUser = async (event, context, callback) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { id, username } = requestBody;
    if (!id) {
      throw new BadRequestException();
    }
    // throw new ForbiddenException();
    const { error } = userValidation.validate({
      id,
      username,
    });
    if (error) {
      transformJoiException(error, 'Unable to edit user');
    }
    // extracting the update attributes specified in the request
    const updateAttributes = extractExistingProperties(requestBody, ['username']);
    // creating ann UpdateExpression and ExpressionAttributeValues for dynamoDb
    const UpdateExpression = (() => {
      let exp = 'set ';
      let attrs = [];
      Object.keys(updateAttributes).forEach((attr) => {
        attrs.push(`${attr} = :${attr}`);
      });
      exp += attrs.join(', ');
      return exp;
    })();
    const ExpressionAttributeValues = (() => {
      let exp = {};
      Object.entries(updateAttributes).forEach((entry) => {
        const [ key, value ] = entry;
        exp[`:${key}`] = value;
      });
      return exp;
    })();
    // creating the dynamoDb request params
    const params = {
      TableName: USERS_TABLE,
      Key: {
        id: id,
      },
      UpdateExpression,
      ExpressionAttributeValues,
      ReturnValues: 'UPDATED_NEW'
    };
    // making request to dynamoDb
    const result = await dynamoDb.update(params).promise();
    const response = getSuccessResponse(result);
    return response;
  } catch(error) {
    const response = getErrorResponse(error);
    return response;
  }
};
