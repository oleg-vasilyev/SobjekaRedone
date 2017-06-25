const url = require('url');
const rx = require('rxjs/Rx');
const vk = require('../lib/vk');



function getFriendsGraph(req, res) {
	const parsedUrl = url.parse(req.url, true);

	const token = parsedUrl.query.token;
	const userID = parsedUrl.query.userID;

	const getFriendsIDSObserver = new rx.Subject();
	const getMutualFriendsObserver = new rx.Subject();
	const getUsersInfoObserver = new rx.Subject();

	rx.Observable.forkJoin(
		getFriendsIDSObserver,
		getMutualFriendsObserver,
		getUsersInfoObserver,
		(userFriends, mutualFriends, usersInfo) => { return { userFriends, mutualFriends, usersInfo } }).subscribe(result => {
			let nodes = [];
			let links = [];

			const userFriends = result.userFriends;
			const mutualFriends = result.mutualFriends;
			const usersInfo = result.usersInfo;

			let modifiedData = [{
				id: userID,
				commonFriends: userFriends
			}];

			for (let mutualFriend of mutualFriends) {
				modifiedData.push({
					id: mutualFriend['id'],
					commonFriends: mutualFriend['common_friends']
				})
			}

			for (let index = 0; index < modifiedData.length; index++) {
				const modifiedDataItem = modifiedData[index];

				let modifiedUserInfo = usersInfo.find(d => modifiedDataItem.id == d['id']);
				if (!modifiedUserInfo) throw Error(`Could't get information about the user with id = ${modifiedDataItem.id}`);

				for (let key of ["first_name", "last_name", "bdate", "city", "photo_100"]) {
					if (!modifiedUserInfo[key]) {
						switch (key) {
							case "first_name":
								modifiedUserInfo[key] = "";
								break;
							case "last_name":
								modifiedUserInfo[key] = "";
								break;
							case "bdate":
								modifiedUserInfo[key] = "not specified";
								break;
							case "city":
								modifiedUserInfo[key] = { title: "not specified" };
								break;
							case "photo_100":
								modifiedUserInfo[key] = "https://pp.userapi.com/c837722/v837722501/3818d/tpiK2vjZKTc.jpg";
								break;
						}
					}
				}

				nodes.push({
					id: index,
					link: modifiedUserInfo.id,
					userName: `${modifiedUserInfo.first_name} ${modifiedUserInfo.last_name}`,
					birthday: modifiedUserInfo.bdate,
					city: modifiedUserInfo.city.title,
					photoURL: modifiedUserInfo.photo_100
				});
			}

			for (let modifiedDataItem of modifiedData) {
				const sourceIDInNodes = nodes.find(n => n.link == modifiedDataItem.id).id;
				const targetIDSInNodes = modifiedDataItem.commonFriends.map(friendID => nodes.find(n => n.link == friendID).id);

				for (let targetIDInNodes of targetIDSInNodes) {
					links.push({
						source: sourceIDInNodes,
						target: targetIDInNodes
					})
				}
			}
			//TODO: link filtration

			const friendsGraph = { nodes, links };
			const json = JSON.stringify(friendsGraph);
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(json);
		});


	getFriendsIDSObserver.subscribe((ids) => {
		vk.getMutualFriends(token, userID, ids, (error, result) => {
			if (error) throw error;
			getMutualFriendsObserver.next(result);
			getMutualFriendsObserver.complete();
		})
	});

	getFriendsIDSObserver.subscribe((ids) => {
		let usersIDS = ids.concat(+userID);
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