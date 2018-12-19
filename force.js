console.log('hello world! starting up now...');

width  = 600
height = 600

data = null

// make this a global variable, otherwise it doesn't
// "remember" the domain that it implicitly learns
var scale = d3.scaleOrdinal(d3.schemeCategory10);

function download(content, fileName, contentType) {
    var a = document.createElement("a");
    var file = new Blob([JSON.stringify(content)], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

drag = simulation => {
  
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}

function color(d) {
  return scale(d.group);
}

function forceSimulation(nodes, links) {
  return d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter());
      // .force("x", d3.forceX())
      // .force("y", d3.forceY());
}

const svg = d3.select('body').append('svg')
  .attr('width', width)
  .attr('height', height)
  .attr("viewBox", [-width / 2, -height / 2, width, height]);

function loadData(dataURL) {
  console.log('loadData called with URL');
  
  // remove old graph
  d3.selectAll("g").remove()
  console.log('removed all g elements from svg (I think)');
  
  // reset color
  scale = d3.scaleOrdinal(d3.schemeCategory10);
  
  d3.json(dataURL)
    .then(d => {
      
      data = d
      
      console.log('allegedly just rewrote data...');
      
      const links = data.links.map(d => Object.create(d));
      const nodes = data.nodes.map(d => Object.create(d));
      
      function ticked() {
        link
            .attr("x1", d => d.source.x)
            .attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x)
            .attr("y2", d => d.target.y);
        
        node
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
      }
      
      const simulation = forceSimulation(nodes, links)
        .on("tick", ticked);
      
      const link = svg.append("g")
          .attr("stroke", "#999")
          .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .enter().append("line")
          .attr("stroke-width", d => Math.sqrt(d.value));
      
      const node = svg.append("g")
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .enter().append("circle")
          .attr("r", 5)
          .attr("fill", color)
          .call(drag(simulation));
      
      node.append("title")
          .text(d => d.id);
  })
}

d3.select('input')
  .on('change', function() {
    console.log('apparently the file has been changed...');
    var file = d3.event.target.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onloadend = function(evt) {
          var dataUrl = evt.target.result;
          loadData(dataUrl);
        };
       reader.readAsDataURL(file);
      }
  })

d3.select('button')
  .on('click', function() {
    download(data, 'graph.json', 'text/plain')
  })

loadData("miserables.json")
