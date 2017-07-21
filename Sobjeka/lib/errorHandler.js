const colors = require('colors');

function errorHandler(res, error) {
	console.error(colors.red(error));
	res.writeHead(500, { 'Contet-Type': 'text/plain' });
	res.end(error.message);
}

module.exports = errorHandler;