module.exports = (passed, { principalId, user }) => {
	const document = {
		"principalId": principalId,
		"policyDocument": {
			"Version": "2012-10-17",
			"Statement": [
				{
					"Action": "execute-api:Invoke",
					"Resource": "*",
					"Effect": passed ? "Allow" : "Deny",
				},
			],
		},
		"context": {
			"user": user,
		},
	};
	return document;
};
