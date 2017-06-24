const containerName = "sobjeka--user-friends-chart";

let selectedNode = null;

let data = null;

let openUser = (id) => window.open(`https://vk.com/id${id}`);

let drawDetails = (selectedNode) => {
	$('image-container').html(`<img src="${selectedNode.photoURL}" onclick="openUser(${selectedNode.link})"/>`);
	$('info-container--user-name').text(selectedNode.userName);
	$('info-container--birthday').text(selectedNode.birthday);
	$('info-container--city').text(selectedNode.city);
}


let drawChart = (data) => {

	let zoom = d3.behavior.zoom()
		.scaleExtent([0.5, 2])
		.on("zoom", () => { container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); });

	var drag = d3.behavior.drag()
		.origin(function (d) { return d; })
		.on("dragstart", function (evt) {
			d3.event.sourceEvent.stopPropagation();
			force.start();
		})
		.on("drag", function (d) {
			d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
		})

	let selectedNode = data.nodes[0];

	let onNodeClick = function (nodeData) {
		selectedNode = nodeData;
		node.classed("selected", (d) => nodeData.id === d.id ? true : false)
		link.classed("active", (d) => nodeData.id === d.source.id || nodeData.id === d.target.id ? true : false);
		drawDetails(nodeData);
	}

	let width = $(containerName).width();
	let height = $(containerName).height();

	let svg = d3
		.select(containerName)
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.call(zoom);

	var rect = svg.append("rect")
		.attr("width", width)
		.attr("height", height)
		.style("fill", "none")
		.style("pointer-events", "all");

	let container = svg.append("g");

	let force = d3.layout
		.force()
		.gravity(0.06)
		.linkDistance(600)
		.charge(-3000)
		.friction(.9)
		.size([width, height]);

	force
		.nodes(data.nodes)
		.links(data.links)
		.start();

	let link =
		container
			.selectAll(".link")
			.data(data.links)
			.enter()
			.append("line")
			.attr("class", "link");

	let node =
		container
			.selectAll(".node")
			.data(data.nodes)
			.enter()
			.append("g")
			.on("click", onNodeClick)
			.attr("class", "node")
			.call(drag);

	let imagePattern = node.append("pattern")
		.attr("id", (d) => d.id)
		.attr("height", 1)
		.attr("width", 1)
		.attr("x", "0")
		.attr("y", "0");

	imagePattern.append("image")
		.attr("height", 85)
		.attr("width", 85)
		.attr("xlink:href", (d) => d.photoURL)

	let circles = node.append("circle")
		.attr("r", 40)
		.attr("cy", 0)
		.attr("cx", 0)
		.attr("fill", (d) => `url(#${d.id})`)

	force.on("tick", () => {
		link
			.attr("x1", (d) => d.source.x)
			.attr("y1", (d) => d.source.y)
			.attr("x2", (d) => d.target.x)
			.attr("y2", (d) => d.target.y);
		node
			.attr("transform", (d) => "translate(" + d.x + "," + d.y + ")")
	});
	onNodeClick(selectedNode);
}

$(window).resize(() => {
	if (data) {
		$(containerName).empty();
		drawChart(data);
	}
});

$(() => {
	if (window.location.href.indexOf("access_token") == -1) {
		window.location.href = "https://oauth.vk.com/authorize?client_id=5972860&scope=users,friends&redirect_uri=http://localhost:3001/&response_type=token";
	}
	else {
		let tokenMatches = window.location.hash.match(/access_token=.*?&/);
		let token = null;
		if (tokenMatches) {
			token = tokenMatches[0].split("=")[1].slice(0, -1);
		}
		//token = null;

		let userIDMatches = window.location.hash.match(/user_id=.*/)
		let userID = null;
		if (userIDMatches) {
			userID = userIDMatches[0].split("=")[1];
		}

		$.ajax({
			url: "http://localhost:3000/myfriendsgraph",
			data: {
				token,
				userID
			},
			type: "GET",
			success: (dataJSON) => {
				console.log("success!")
				data = JSON.parse(dataJSON);
				drawChart(data);
			},
			error: (e) => {
				console.log("error!")
				console.log(e);
			}
		});
	}


	// let dataJSON = {
	// 	"nodes": [
	// 		{
	// 			"id": 0,
	// 			"link": 113333501,
	// 			"userName": "Oleg Vasilyev",
	// 			"birthday": "28.3.1996",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c626216/v626216501/58ece/zthRGh2Fprc.jpg"
	// 		},
	// 		{
	// 			"id": 1,
	// 			"link": 3985995,
	// 			"userName": "Alexey Popov",
	// 			"birthday": "7.5.1984",
	// 			"city": "San Francisco",
	// 			"photoURL": "https://pp.userapi.com/c639726/v639726995/8dd3/JkKGsdU4D_Q.jpg"
	// 		},
	// 		{
	// 			"id": 2,
	// 			"link": 6151485,
	// 			"userName": "Mikhail Kopychko",
	// 			"birthday": "15.12.1988",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c631426/v631426485/370ff/GvcvBSQ3Pjo.jpg"
	// 		},
	// 		{
	// 			"id": 3,
	// 			"link": 17666590,
	// 			"userName": "Konstantin Ovsyannikov",
	// 			"birthday": "20.12.1975",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c619123/v619123590/1ba98/pyUNDxfvKV4.jpg"
	// 		},
	// 		{
	// 			"id": 4,
	// 			"link": 38229921,
	// 			"userName": "Ira Snapkova",
	// 			"birthday": "29.12",
	// 			"city": "/not specified/",
	// 			"photoURL": "https://pp.userapi.com/c637622/v637622921/b8ab/XW3eCWYBK2o.jpg"
	// 		},
	// 		{
	// 			"id": 5,
	// 			"link": 41296285,
	// 			"userName": "Evgeny Sergeev",
	// 			"birthday": "7.8.1995",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c639726/v639726285/17328/z2_G3OErnvQ.jpg"
	// 		},
	// 		{
	// 			"id": 6,
	// 			"link": 43325240,
	// 			"userName": "Zhenya Kuzmichyov",
	// 			"birthday": "20.9",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c639524/v639524240/133da/Cqx_fGvDmvg.jpg"
	// 		},
	// 		{
	// 			"id": 7,
	// 			"link": 43574063,
	// 			"userName": "Yulia Avdeeva",
	// 			"birthday": "16.4",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c639831/v639831063/365ff/Xc8QYdJwB7M.jpg"
	// 		},
	// 		{
	// 			"id": 8,
	// 			"link": 44605297,
	// 			"userName": "Marina Grishina",
	// 			"birthday": "26.3.1996",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c837727/v837727297/39ffb/ems1Ib9BTF8.jpg"
	// 		},
	// 		{
	// 			"id": 9,
	// 			"link": 45395224,
	// 			"userName": "Maxim Alkhovik",
	// 			"birthday": "4.7.1995",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c413721/v413721224/7dd4/b_A2HjcCcDs.jpg"
	// 		},
	// 		{
	// 			"id": 10,
	// 			"link": 48416512,
	// 			"userName": "Artyom Samosadov",
	// 			"birthday": "5.7.1994",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c629105/v629105512/a192/0D9R6MB1UAU.jpg"
	// 		},
	// 		{
	// 			"id": 11,
	// 			"link": 52027186,
	// 			"userName": "Andrey Kurilov",
	// 			"birthday": "9.12",
	// 			"city": "/not specified/",
	// 			"photoURL": "https://pp.userapi.com/c604318/v604318186/c5c5/irmlh1VozOM.jpg"
	// 		},
	// 		{
	// 			"id": 12,
	// 			"link": 64236042,
	// 			"userName": "Kristina Gromyko",
	// 			"birthday": "/not specified/",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c621717/v621717042/3d917/51GXABJ5Q0I.jpg"
	// 		},
	// 		{
	// 			"id": 13,
	// 			"link": 66113635,
	// 			"userName": "Konstantin Ignatenko",
	// 			"birthday": "5.4",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c837135/v837135635/315b9/rUDYnvKAfgE.jpg"
	// 		},
	// 		{
	// 			"id": 14,
	// 			"link": 69354344,
	// 			"userName": "Alexander Stukachyov",
	// 			"birthday": "11.10",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c604629/v604629344/2e102/rY12iIfW1Es.jpg"
	// 		},
	// 		{
	// 			"id": 15,
	// 			"link": 70205223,
	// 			"userName": "Ekaterina Nasytko",
	// 			"birthday": "1.8",
	// 			"city": "Dorogobuzh",
	// 			"photoURL": "https://pp.userapi.com/c639124/v639124223/cbca/BUA4k7QiHwI.jpg"
	// 		},
	// 		{
	// 			"id": 16,
	// 			"link": 75038737,
	// 			"userName": "Ivan Kucher",
	// 			"birthday": "24.5.1994",
	// 			"city": "Minsk",
	// 			"photoURL": "https://pp.userapi.com/c633124/v633124737/393b1/GnNhbvndvT0.jpg"
	// 		},
	// 		{
	// 			"id": 17,
	// 			"link": 85697114,
	// 			"userName": "Artem Grinberg",
	// 			"birthday": "/not specified/",
	// 			"city": "/not specified/",
	// 			"photoURL": "https://pp.userapi.com/c836235/v836235114/18341/61oNRH_gULo.jpg"
	// 		},
	// 		{
	// 			"id": 18,
	// 			"link": 87085216,
	// 			"userName": "Egor Feoktistov",
	// 			"birthday": "25.9.1996",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c631624/v631624216/7a00/-cio5Q20mX8.jpg"
	// 		},
	// 		{
	// 			"id": 19,
	// 			"link": 94286052,
	// 			"userName": "Alexander Filipenko",
	// 			"birthday": "/not specified/",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c622020/v622020052/3f88f/Odv-TVvVF-M.jpg"
	// 		},
	// 		{
	// 			"id": 20,
	// 			"link": 97121748,
	// 			"userName": "Alexey Alinovsky",
	// 			"birthday": "23.3.1996",
	// 			"city": "/not specified/",
	// 			"photoURL": "https://pp.userapi.com/c323318/v323318748/97f1/cCtsomoivz4.jpg"
	// 		},
	// 		{
	// 			"id": 21,
	// 			"link": 119428759,
	// 			"userName": "Vladislav Sheverda",
	// 			"birthday": "7.6",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c623220/v623220759/44813/5P_ec9jzDvM.jpg"
	// 		},
	// 		{
	// 			"id": 22,
	// 			"link": 131545193,
	// 			"userName": "Maria Leonova",
	// 			"birthday": "/not specified/",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c624923/v624923193/24cd7/ZFVkVUrV01s.jpg"
	// 		},
	// 		{
	// 			"id": 23,
	// 			"link": 135011230,
	// 			"userName": "Pavel Savchkov",
	// 			"birthday": "8.7.1996",
	// 			"city": "/not specified/",
	// 			"photoURL": "https://pp.userapi.com/c837439/v837439230/37aa3/9z4hIarzT84.jpg"
	// 		},
	// 		{
	// 			"id": 24,
	// 			"link": 137487734,
	// 			"userName": "Kolya Slavikov",
	// 			"birthday": "11.3",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c406818/v406818734/bf4c/up6wP0x1YmM.jpg"
	// 		},
	// 		{
	// 			"id": 25,
	// 			"link": 139902631,
	// 			"userName": "Kirill Veretennikovv",
	// 			"birthday": "/not specified/",
	// 			"city": "Minsk",
	// 			"photoURL": "https://pp.userapi.com/c604322/v604322631/1ccb9/_RkAE90T7zk.jpg"
	// 		},
	// 		{
	// 			"id": 26,
	// 			"link": 141095726,
	// 			"userName": "Tyoma Ryabkovets",
	// 			"birthday": "13.9.1995",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c636229/v636229726/70250/F8iXySeV7lQ.jpg"
	// 		},
	// 		{
	// 			"id": 27,
	// 			"link": 144535102,
	// 			"userName": "Anna Sergachyova",
	// 			"birthday": "7.7.1997",
	// 			"city": "/not specified/",
	// 			"photoURL": "https://pp.userapi.com/c637821/v637821102/1e063/p2iHwqTp7mc.jpg"
	// 		},
	// 		{
	// 			"id": 28,
	// 			"link": 146558488,
	// 			"userName": "Katreen Novitskaya",
	// 			"birthday": "27.9",
	// 			"city": "Brest",
	// 			"photoURL": "https://pp.userapi.com/c627231/v627231488/85ca/lAUKEUKNCvs.jpg"
	// 		},
	// 		{
	// 			"id": 29,
	// 			"link": 150561710,
	// 			"userName": "Evgeny Kaminsky",
	// 			"birthday": "28.9.1995",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c626816/v626816710/36734/fmMetzt3_AY.jpg"
	// 		},
	// 		{
	// 			"id": 30,
	// 			"link": 177356904,
	// 			"userName": "Maxim Kontsevoy",
	// 			"birthday": "/not specified/",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c412629/v412629904/2240/1dijEAtjrwQ.jpg"
	// 		},
	// 		{
	// 			"id": 31,
	// 			"link": 188293825,
	// 			"userName": "Vlad Novitsky",
	// 			"birthday": "25.3",
	// 			"city": "Brest",
	// 			"photoURL": "https://pp.userapi.com/c639824/v639824825/14baf/3oVd2cCPcGI.jpg"
	// 		},
	// 		{
	// 			"id": 32,
	// 			"link": 319847001,
	// 			"userName": "Razmowny Klub",
	// 			"birthday": "/not specified/",
	// 			"city": "Mogilev",
	// 			"photoURL": "https://pp.userapi.com/c624331/v624331001/3f201/w_uZkotC8Nc.jpg"
	// 		}
	// 	],
	// 	"links": [
	// 		{
	// 			"source": 0,
	// 			"target": 1
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 2
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 3
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 4
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 5
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 6
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 8
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 9
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 12
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 15
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 16
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 17
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 18
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 19
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 23
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 25
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 26
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 27
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 28
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 29
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 31
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 32
	// 		},
	// 		{
	// 			"source": 0,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 1,
	// 			"target": 4
	// 		},
	// 		{
	// 			"source": 1,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 2,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 3,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 3,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 3,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 3,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 3,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 4,
	// 			"target": 1
	// 		},
	// 		{
	// 			"source": 4,
	// 			"target": 32
	// 		},
	// 		{
	// 			"source": 4,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 8
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 9
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 12
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 15
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 18
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 5,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 6,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 6,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 6,
	// 			"target": 18
	// 		},
	// 		{
	// 			"source": 6,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 6,
	// 			"target": 25
	// 		},
	// 		{
	// 			"source": 6,
	// 			"target": 26
	// 		},
	// 		{
	// 			"source": 6,
	// 			"target": 29
	// 		},
	// 		{
	// 			"source": 6,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 3
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 5
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 8
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 9
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 12
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 15
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 18
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 23
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 26
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 7,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 8,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 8,
	// 			"target": 12
	// 		},
	// 		{
	// 			"source": 8,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 8,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 8,
	// 			"target": 23
	// 		},
	// 		{
	// 			"source": 8,
	// 			"target": 26
	// 		},
	// 		{
	// 			"source": 8,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 5
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 8
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 12
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 18
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 23
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 9,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 5
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 8
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 9
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 15
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 18
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 23
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 10,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 11,
	// 			"target": 6
	// 		},
	// 		{
	// 			"source": 11,
	// 			"target": 25
	// 		},
	// 		{
	// 			"source": 11,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 12,
	// 			"target": 5
	// 		},
	// 		{
	// 			"source": 12,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 12,
	// 			"target": 8
	// 		},
	// 		{
	// 			"source": 12,
	// 			"target": 9
	// 		},
	// 		{
	// 			"source": 12,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 12,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 12,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 12,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 12,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 12,
	// 			"target": 23
	// 		},
	// 		{
	// 			"source": 12,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 12,
	// 			"target": 26
	// 		},
	// 		{
	// 			"source": 12,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 12,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 5
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 8
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 9
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 12
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 15
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 18
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 23
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 13,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 14,
	// 			"target": 6
	// 		},
	// 		{
	// 			"source": 14,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 14,
	// 			"target": 9
	// 		},
	// 		{
	// 			"source": 14,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 14,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 14,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 14,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 14,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 14,
	// 			"target": 23
	// 		},
	// 		{
	// 			"source": 14,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 14,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 15,
	// 			"target": 5
	// 		},
	// 		{
	// 			"source": 15,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 15,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 15,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 15,
	// 			"target": 18
	// 		},
	// 		{
	// 			"source": 15,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 15,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 15,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 15,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 15,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 15,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 16,
	// 			"target": 27
	// 		},
	// 		{
	// 			"source": 16,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 17,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 5
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 6
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 8
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 9
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 15
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 23
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 18,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 19,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 19,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 3
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 5
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 8
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 9
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 12
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 15
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 18
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 23
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 20,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 5
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 9
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 12
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 15
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 18
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 23
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 26
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 21,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 5
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 8
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 9
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 12
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 15
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 18
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 23
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 22,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 8
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 9
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 12
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 18
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 23,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 3
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 5
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 6
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 8
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 9
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 12
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 15
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 18
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 23
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 30
	// 		},
	// 		{
	// 			"source": 24,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 25,
	// 			"target": 6
	// 		},
	// 		{
	// 			"source": 25,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 25,
	// 			"target": 26
	// 		},
	// 		{
	// 			"source": 25,
	// 			"target": 29
	// 		},
	// 		{
	// 			"source": 25,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 26,
	// 			"target": 6
	// 		},
	// 		{
	// 			"source": 26,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 26,
	// 			"target": 8
	// 		},
	// 		{
	// 			"source": 26,
	// 			"target": 12
	// 		},
	// 		{
	// 			"source": 26,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 26,
	// 			"target": 25
	// 		},
	// 		{
	// 			"source": 26,
	// 			"target": 29
	// 		},
	// 		{
	// 			"source": 26,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 27,
	// 			"target": 16
	// 		},
	// 		{
	// 			"source": 27,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 28,
	// 			"target": 31
	// 		},
	// 		{
	// 			"source": 28,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 29,
	// 			"target": 6
	// 		},
	// 		{
	// 			"source": 29,
	// 			"target": 25
	// 		},
	// 		{
	// 			"source": 29,
	// 			"target": 26
	// 		},
	// 		{
	// 			"source": 29,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 5
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 7
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 8
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 9
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 10
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 11
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 12
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 13
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 14
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 15
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 18
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 19
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 20
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 21
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 22
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 23
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 24
	// 		},
	// 		{
	// 			"source": 30,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 31,
	// 			"target": 28
	// 		},
	// 		{
	// 			"source": 31,
	// 			"target": 0
	// 		},
	// 		{
	// 			"source": 32,
	// 			"target": 4
	// 		},
	// 		{
	// 			"source": 32,
	// 			"target": 0
	// 		}
	// 	]
	// }
	// drawChart(dataJSON);

});
