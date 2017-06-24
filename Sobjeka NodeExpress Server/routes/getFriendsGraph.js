const url = require('url');
const rx = require('rxjs/Rx');
const vk = require('../lib/vk');

// const json = JSON.stringify(d);
// res.writeHead(200, { 'Content-Type': 'application/json' });
// res.end(json);

function getFriendsGraph(req, res) {
	const parsedUrl = url.parse(req.url, true);

	const token = parsedUrl.query.token;
	const userID = parsedUrl.query.userID;

	const getFriendsIDSObserver = new rx.Subject();
	const getMutualFriendsIDSObserver = new rx.Subject();
	const getUsersInfoObserver = new rx.Subject();

	rx.Observable.forkJoin(getMutualFriendsIDSObserver, getUsersInfoObserver, (first, second) => {
		return {
			mutualFriendsIDS: first,
			usersInfo: second
		}
	}).subscribe(result => {

		

	});

	getFriendsIDSObserver.subscribe((ids) => {
		vk.getMutualFriendsIDS(token, userID, ids, (error, result) => {
			if (error) throw error;
			getMutualFriendsIDSObserver.next(result);
			getMutualFriendsIDSObserver.complete();
		})
	});

	getFriendsIDSObserver.subscribe((ids) => {
		let usersIDS = ids.concat(userID);
		vk.getUsersInfo(token, usersIDS, (error, result) => {
			if (error) throw error;
			getUsersInfoObserver.next(result);
			getUsersInfoObserver.complete();
		})
	});

	vk.getFriendsIDS(token, userID, (error, result) => {
		if (error) throw error;
		getFriendsIDSObserver.next(result);
		getFriendsIDSObserver.complete();
	});
}

module.exports = getFriendsGraph;