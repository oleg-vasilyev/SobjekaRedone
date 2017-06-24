let token = localStorage.getItem("sobjekaVKToken");
let userID = localStorage.getItem("sobjekaUserID");

$.ajax({
	url: "http://localhost:3000/getfriendsgraph",
	data: { token, userID },
	type: "GET",
	success: (d) => {
		console.log("success")
		console.log(d)
	},
	error: (e) => {
		console.log("error")
		console.log(e);
	}
});