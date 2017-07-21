const url = require('url');
const rx = require('rxjs/Rx');
const vk = require('../lib/vk');
const errorHandler = require('../lib/errorHandler');



function getFriendsGraph(req, res) {

	const handleError = (error) => errorHandler(res, error);

	const parsedUrl = url.parse(req.url, true);

	const token = parsedUrl.query.token;
	const userID = parsedUrl.query.userID;

	const getFriendsIDSObserver = new rx.Subject();
	const getMutualFriendsObserver = new rx.Subject();
	const getUsersInfoObserver = new rx.Subject();
	const getModifiedUsersInfoObserver = new rx.Subject();

	vk.getFriendsIDS(token, userID, (error, result) => {
		if (error) return handleError(error);

		getFriendsIDSObserver.next(result);
		getFriendsIDSObserver.complete();
	});

	getFriendsIDSObserver.subscribe((ids) => {
		let usersIDS = ids.concat(+userID);
		vk.getUsersInfo(token, usersIDS, (error, result) => {
			if (error) return handleError(error);

			getUsersInfoObserver.next(result);
			getUsersInfoObserver.complete();
		})
	});

	getUsersInfoObserver.subscribe(usersInfo => {
		let modifiedUsersInfo = [];

		for (let userInfo of usersInfo) {
			let modifiedUserInfo = userInfo;

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
			modifiedUsersInfo.push(modifiedUserInfo);
		}
		getModifiedUsersInfoObserver.next(modifiedUsersInfo);
		getModifiedUsersInfoObserver.complete();
	});

	getModifiedUsersInfoObserver.subscribe((modifiedUsersInfo) => {
		const ids = modifiedUsersInfo.filter(d => !d.hasOwnProperty("deactivated")).map(d => d["id"]);
		vk.getMutualFriends(token, userID, ids, (error, result) => {
			if (error) return handleError(error);

			getMutualFriendsObserver.next(result);
			getMutualFriendsObserver.complete();
		})
	});

	rx.Observable.forkJoin(
		getFriendsIDSObserver,
		getMutualFriendsObserver,
		getModifiedUsersInfoObserver,
		(userFriendsIDS, mutualFriends, modifiedUsersInfo) => { return { userFriendsIDS, mutualFriends, modifiedUsersInfo } }).subscribe(result => {
			let nodes = [];
			let links = [];

			const userFriendsIDS = result.userFriendsIDS;
			const mutualFriends = result.mutualFriends;
			const modifiedUsersInfo = result.modifiedUsersInfo;

			const deactivatedUsers = modifiedUsersInfo.filter(d => d.hasOwnProperty("deactivated"));

			let modifiedData = [];

			for (let mutualFriend of mutualFriends) {
				modifiedData.push({
					id: mutualFriend['id'],
					commonFriends: mutualFriend['common_friends']
				})
			}

			for (let deactivatedUser of deactivatedUsers) {
				modifiedData.push({
					id: deactivatedUser["id"],
					commonFriends: [userID]
				})
			}

			const userInModifiedData = modifiedData.find(d => d.id == userID);
			const moveElementToFirstPosOfArray = (arr, element, prop) => arr.splice(0, 0, arr.splice(arr.findIndex(o => o[prop] === element[prop]), 1)[0]);

			moveElementToFirstPosOfArray(modifiedData, userInModifiedData, 'id');



			for (let index = 0; index < modifiedData.length; index++) {
				const modifiedDataItem = modifiedData[index];

				let modifiedUserInfo = modifiedUsersInfo.find(d => modifiedDataItem.id == d['id']);
				if (!modifiedUserInfo) return handleError(Error(`Could't get information about the user with id = ${modifiedDataItem.id}`));

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

			const filteredLinks = links.filter((item, pos, self) => {
				return links.find((item1, pos1) => {
					return pos1 > pos && (item1.source === item.target && item1.target === item.source);
				}) == undefined;
			});

			const friendsGraph = { nodes, links: filteredLinks };
			const json = JSON.stringify(friendsGraph);
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(json);
		});
}

module.exports = getFriendsGraph;