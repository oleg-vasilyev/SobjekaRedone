const express = require('express');
const cors = require('cors');
const colors = require('colors');

const { public, home, friendsGraph, getFriendsGraph, error, login } = require('./routes');

express.response.renderHtml = require('./lib/render');

let server = express()
	.use(cors())
	.use((req, res) => {
		if (req.url.match(/\.(html|css|js|png)$/)) {
			public(req, res);
		} else if (req.url === '/') {
			home(req, res);
		} else if (req.url.startsWith('/login')) {
			login(req, res);
		} else if (req.url == '/friendsgraph') {
			friendsGraph(req, res);
		} else if (req.url.startsWith('/getfriendsgraph')) {
			getFriendsGraph(req, res);
		} else {
			error(req, res, 'Not found!');
		}
	})
	.listen(3000, () => console.log('Server is running: http://localhost:3000'.green));



