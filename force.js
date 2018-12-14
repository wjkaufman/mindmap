width  = 500
height = 500

data = null

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

color = d => {
  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  return scale(d.group);
}



function forceSimulation(nodes, links) {
  return d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter());
}

const svg = d3.select('body').append('svg')
  .attr('width', width)
  .attr('height', height)
  .attr("viewBox", [-width / 2, -height / 2, width, height]);

d3.select('body').append('button')

d3.json("miserables.json")
  .then(res => {
    
    data = res
    
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
    
    const simulation = forceSimulation(nodes, links).on("tick", ticked);
    
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
