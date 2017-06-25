const https = require('https');

function getFriendsIDS(token, userID, done) {
	const req = https
		.get(`https://api.vk.com/api.php?oauth=1&method=friends.get&access_token=${token}&user_id=${userID}`, res => {
			if (res.statusCode !== 200) {
				done(new Error(`Error: ${res.statusMessage} (${res.statusCode})`));
				res.resume();
				return;
			}

			res.setEncoding('utf-8');

			let body = '';

			res.on('data', data => body += data);

			res.on('end', () => {
				let result = null;
				try {
					result = JSON.parse(body);
				} catch (error) {
					done(error);
				}

				if (result.error) {
					done(new Error(`Error: ${result.error.error_msg} (${result.error.error_code})`));
				}
				else if (result.response) {
					done(null, result.response);
				}
				else {
					done(new Error(`Error: Invalide response (${body})`));
				}
			});

			res.on('error', error => done(error));

		});
}

function getMutualFriends(token, userID, targetIDS, done) {
	let targetIDSLine = targetIDS.toString();

	const req = https
		.get(`https://api.vk.com/api.php?oauth=1&method=friends.getMutual&access_token=${token}&source_uid=${userID}&target_uids=${targetIDSLine}`, res => {
			if (res.statusCode !== 200) {
				done(new Error(`Error: ${res.statusMessage} (${res.statusCode})`));
				res.resume();
				return;
			}

			res.setEncoding('utf-8');

			let body = '';

			res.on('data', data => body += data);

			res.on('end', () => {
				let result = null;
				try {
					result = JSON.parse(body);
				} catch (error) {
					done(error);
				}

				if (result.error) {
					done(new Error(`Error: ${result.error.error_msg} (${result.error.error_code})`));
				}
				else if (result.response) {
					done(null, result.response);
				}
				else {
					done(new Error(`Error: Invalide response (${body})`));
				}
			});

			res.on('error', error => done(error));

		});
}

function getUsersInfo(token, usersIDS, done) {
	let usersIDSLine = usersIDS.toString();

	const req = https
		.get(`https://api.vk.com/api.php?oauth=1&method=users.get&v=5.8&user_ids=${usersIDSLine}&fields=bdate,city,photo_100&access_token=${token}`, res => {
			if (res.statusCode !== 200) {
				done(new Error(`Error: ${res.statusMessage} (${res.statusCode})`));
				res.resume();
				return;
			}

			res.setEncoding('utf-8');

			let body = '';

			res.on('data', data => body += data);

			res.on('end', () => {
				let result = null;
				try {
					result = JSON.parse(body);
				} catch (error) {
					done(error);
				}

				if (result.error) {
					done(new Error(`Error: ${result.error.error_msg} (${result.error.error_code})`));
				}
				else if (result.response) {
					done(null, result.response);
				}
				else {
					done(new Error(`Error: Invalide response (${body})`));
				}
			});

			res.on('error', error => done(error));

		});
}

module.exports = {
	getFriendsIDS,
	getMutualFriends,
	getUsersInfo
}