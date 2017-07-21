const public = require('./public');
const home = require('./home');
const friendsGraph = require('./friendsGraph');
const getFriendsGraph = require('./getFriendsGraph');
const error = require('./error');
const login = require('./login');

module.exports = {
	public,
	home,
	friendsGraph,
	getFriendsGraph,
	error,
	login
}