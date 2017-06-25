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

let drawGraph = (data) => {

	let zoom = d3.behavior.zoom()
		.scaleExtent([0.5, 2])
		.on("zoom", () => { container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); });

	let drag = d3.behavior.drag()
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

	let rect = svg.append("rect")
		.attr("width", width)
		.attr("height", height)
		.style("fill", "none")
		.style("pointer-events", "all");

	let container = svg.append("g");

	let force = d3.layout
		.force()
		.gravity(0.05)
		.linkDistance(800)
		.charge(-1000)
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
		drawGraph(data);
	}
});

$(() => {
	const token = localStorage.getItem("sobjekaVKToken");
	const userID = localStorage.getItem("sobjekaUserID");

	$.ajax({
		url: "http://localhost:3000/getfriendsgraph",
		data: { token, userID },
		type: "GET",
		success: (d) => {
			console.log("success");
			console.log(d);
			data = d;
			drawGraph(data);
		},
		error: (e) => {
			console.log("error");
			console.log(e);
		}
	});
});

