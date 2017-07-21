function error(req, res, errorMessage) {
	res.renderHtml('error.html', { errorMessage });
}

module.exports = error;