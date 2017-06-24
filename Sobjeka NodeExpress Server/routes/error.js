function error(req, res) {
	res.renderHtml('error.html', { error: 'Not found' });
}

module.exports = error;