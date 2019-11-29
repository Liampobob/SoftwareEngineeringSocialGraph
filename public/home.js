function getInfo(element){
    const query = window.location.search.substring(1)
    const token = query.split('access_token=')[1]
    fetch('https://api.github.com/user', {
            headers: {
                Authorization: 'token ' + token
            }
        })
        .then(res => res.json())
        .then(res => {
            var avatar = document.createElement('img')
            avatar.src = res.avatar_url
			avatar.alt = '${res.login}'
			avatar.height = 225
			avatar.width = 225
			document.getElementById(element).appendChild(avatar)
			var name = document.createElement('h')
			name.innerText = `Welcome, ${res.login}.\n`
			document.getElementById(element).appendChild(name)
			var sidebar = document.createElement(`h`)
			sidebar.innerText = 'Pick a repo:'
			document.getElementById(element).appendChild(sidebar)
        })   
}

function generateRepos(element){
	const query = window.location.search.substring(1)
    const token = query.split('access_token=')[1]
    fetch('https://api.github.com/users/liampobob/repos', {
            headers: {
                Authorization: 'token ' + token
            }
        })
        .then(res => res.json())
        .then(res => {
			for(i = 0; i < res.length; i ++){
				var tmp = document.createElement('a')
				tmp.href = '#'
				tmp.addEventListener('click', function() { createGraphs(this.innerHTML) }, false)
				tmp.innerHTML = res[i].name + "\n"
				document.getElementById(element).appendChild(tmp)
			}
        })   
}

function createGraphs(repo){
	document.getElementById('legraph').innerHTML = '';
	var header = document.createElement('h')
	header.innerText = "Graphs relating to " + repo
	document.getElementById('legraph').appendChild(header)
	drawCommitHistoryGraph(repo)
	drawLineChangeGraph(repo)
}

function drawCommitHistoryGraph(repo){
	// set the dimensions and margins of the graph
	var margin = {top: 30, right: 30, bottom: 30, left: 30},
	width = 450 - margin.left - margin.right,
	height = 450 - margin.top - margin.bottom;

	// append the svg object to the body of the page
	var svg = d3.select('#legraph')
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform",
		"translate(" + margin.left + "," + margin.top + ")");

	// Labels of row and columns
	var myGroups = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
	var myVars = ["0", "1",  "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]

	// Build X scales and axis:
	var x = d3.scaleBand()
	.range([ 0, width ])
	.domain([0,1,2,3,4,5,6])
	.padding(0.01);
	svg.append("g")
	.attr("transform", "translate(0," + height + ")")
	.call(d3.axisBottom(x))

	// Build X scales and axis:
	var y = d3.scaleBand()
	.range([ height, 0 ])
	.domain(myVars)
	.padding(0.01);
	svg.append("g")
	.call(d3.axisLeft(y));

	// Build color scale
	var myColor = d3.scaleLinear()
	.range(["White", "#05b08a"])
	.domain([0,7])

	//Read the data
	d3.json('//api.github.com/repos/liampobob/' + repo + '/stats/punch_card', function(data) {
	// create a tooltip
	var tooltip = d3.select('#legraph')
	.append("div")
	.style("opacity", 0)
	.attr("class", "tooltip")
	.style("background-color", "white")
	.style("border", "solid")
	.style("border-width", "2px")
	.style("border-radius", "5px")
	.style("padding", "5px")

	// Three function that change the tooltip when user hover / move / leave a cell
	var mouseover = function(d) {
	tooltip.style("opacity", 1)
	}
	var mousemove = function(d) {
	tooltip
		.html("The exact value of<br>this cell is: " + d[2])
		.style("left", (d3.mouse(this)[0]+70) + "px")
		.style("top", (d3.mouse(this)[1]) + "px")
	}
	var mouseleave = function(d) {
	tooltip.style("opacity", 0)
	}

	// add the squares
	svg.selectAll()
	.data(data)
	.enter()
	.append("rect")
		.attr("x", function(d) { return x(d[0]) })
		.attr("y", function(d) { return y(d[1]) })
		.attr("width", x.bandwidth() )
		.attr("height", y.bandwidth() )
		.style("fill", function(d) { return myColor(d[2])} )
	.on("mouseover", mouseover)
	.on("mousemove", mousemove)
	.on("mouseleave", mouseleave)
	})
}


function drawLineChangeGraph(repo){

	// set the dimensions and margins of the graph
	var margin = {top: 10, right: 30, bottom: 20, left: 50},
		width = 460 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

	// append the svg object to the body of the page
	var svg = d3.select("#legraph")
	.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	.append("g")
		.attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");

  // Parse the Data
  d3.json('//api.github.com/repos/liampobob/' + repo + '/stats/contributors', function(data) {
  console.log(data)

  // List of groups = species here = value of the first column called group -> I show them on the X axis
  var groups = d3.map(data, function(d){return(d.author.login)}).keys()

  // Add X axis
  var x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain([0, 20])
    .range([ height, 0 ]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Show the bars
  svg.append("g")
    .selectAll("g")
	.data(data)
	.enter()
	.append("rect")
      .attr("fill", function() { return "#05b08a"; })
	  .attr("x", function(d) { return x(d.author.login); })
	  .attr("y", function(d) { return y(d.total); })
	  .attr("height", function(d) { return (18*d.total) + 1; })
	  .attr("width",x.bandwidth())
})
}