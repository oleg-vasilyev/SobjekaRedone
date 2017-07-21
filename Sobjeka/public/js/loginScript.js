if (window.location.pathname === '/login') {
	if (window.location.hash.indexOf("access_token") == -1) {
		window.location.href = "https://oauth.vk.com/authorize?client_id=5972860&scope=users,friends&redirect_uri=http://localhost:3000/login&response_type=token";
	}
	else {
		let token = null;
		let userID = null;

		let tokenMatches = window.location.hash.match(/access_token=.*?&/);
		if (tokenMatches) {
			token = tokenMatches[0].split("=")[1].slice(0, -1);
		}

		let userIDMatches = window.location.hash.match(/user_id=.*/)
		if (userIDMatches) {
			userID = userIDMatches[0].split("=")[1];
		}

		localStorage.setItem('sobjekaVKToken', token);
		localStorage.setItem('sobjekaUserID', userID);

		window.location.href = "http://localhost:3000/friendsgraph";
	}
}