// function to create the brushable scatter plot
function brushableScatterplot() {
    // set up
    const margin = ({top:10, right:20, bottom:50, left:105});

    const visWidth = 420;
    const visHeight = 420;

    const BikeTypes = Array.from(new Set(DivvyData.map(d => d.bike)));
    const bikeColor = d3.scaleOrdinal().domain(BikeTypes).range(d3.schemeCategory10);

    var x = d3.scaleLinear()
    .domain(d3.extent(DivvyData, d => d.time)).nice()
    .range([0, visWidth])

    var y = d3.scaleLinear()
    .domain(d3.extent(DivvyData, d => d.distance)).nice()
    .range([visHeight, 0])

    var xAxis = (g, scale, label) =>
  g.attr('transform', `translate(0, ${visHeight})`)
      // add axis
      .call(d3.axisBottom(scale))
      // remove baseline
      .call(g => g.select('.domain').remove())
      // add grid lines
      // references https://observablehq.com/@d3/connected-scatterplot
      .call(g => g.selectAll('.tick line')
        .clone()
          .attr('stroke', '#d3d3d3')
          .attr('y1', -visHeight)
          .attr('y2', 0))
    // add label
    .append('text')
      .attr('x', visWidth / 2)
      .attr('y', 40)
      .attr('fill', 'black')
      .attr('text-anchor', 'middle')
      .text(label)

    var yAxis = (g, scale, label) => 
    // add axis
    g.call(d3.axisLeft(scale))
        // remove baseline
        .call(g => g.select('.domain').remove())
        // add grid lines
        // refernces https://observablehq.com/@d3/connected-scatterplot
        .call(g => g.selectAll('.tick line')
          .clone()
            .attr('stroke', '#d3d3d3')
            .attr('x1', 0)
            .attr('x2', visWidth))
      // add label
      .append('text')
        .attr('x', -40)
        .attr('y', visHeight / 2)
        .attr('fill', 'black')
        .attr('dominant-baseline', 'middle')
        .text(label)
    
    // the value for when there is no brush
    const initialValue = DivvyData;
  
    const svg = d3.select("#scatter")
        .append("svg")
        .attr('width', visWidth + margin.left + margin.right)
        .attr('height', visHeight + margin.top + margin.bottom)
        .property('value', initialValue);
  
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    
    // axes
    g.append("g").call(xAxis, x, 'Time (Hours)');
    g.append("g").call(yAxis, y, 'Miles (Miles)');
    
    // draw points
    svg.append("text")
     .attr("x", visWidth/2 + 100)
     .attr("y", 13)
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .text("");
    
    const radius = 3;
    
    const dots = g.selectAll('circle')
      .data(DivvyData)
      .join('circle')
        .attr('cx', d => x(d.time))
        .attr('cy', d => y(d.distance))
        .attr('fill', d =>  bikeColor(d.bike))
        .attr('opacity', 1)
        .attr('r', radius);
    
    // ********** brushing here **********
    
    const brush = d3.brush()
        // set the space that the brush can take up
        .extent([[0, 0], [visWidth, visHeight]])
        // handle events
        .on('brush', onBrush)
        .on('end', onEnd);
    
    g.append('g')
        .call(brush);
    
    function onBrush(event) {
      // event.selection gives us the coordinates of the
      // top left and bottom right of the brush box
      const [[x1, y1], [x2, y2]] = event.selection;
      
      // return true if the dot is in the brush box, false otherwise
      function isBrushed(d) {
        const cx = x(d.time);
        const cy = y(d.distance)
        return cx >= x1 && cx <= x2 && cy >= y1 && cy <= y2;
      } 
      
      // style the dots
      dots.attr('fill', d => isBrushed(d) ? bikeColor(d.bike) : 'gray');
      
      // update the data that appears in the bikes variable
      svg.property('value', DivvyData.filter(isBrushed)).dispatch('input');
    }
    
    function onEnd(event) {
      // if the brush is cleared
      if (event.selection === null) {
        // reset the color of all of the dots
        dots.attr('fill', d => bikeColor(d.bike));
        svg.property('value', initialValue).dispatch('input');
      }
    }
  
    return svg.node();
  }

  // function to create the bar chart
  function barChart() {
    // set up
    
    const margin = {top: 10, right: 20, bottom: 50, left: 90};
    
    const visWidth = 400;
    const visHeight = 200;

    const BikeTypes = Array.from(new Set(DivvyData.map(d => d.bike)));
    const bikeColor = d3.scaleOrdinal().domain(BikeTypes).range(d3.schemeCategory10);
  
    const svg = d3.select("#bar")
        .append("svg")
        .attr('width', visWidth + margin.left + margin.right)
        .attr('height', visHeight + margin.top + margin.bottom);
  
    const g = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    svg.append("text")
     .attr("x", visWidth/2 + 100)
     .attr("y", 15)
     .attr("text-anchor", "middle")
     .style("font-size", "16px")
     .text("");
    // create scales
    
    const x = d3.scaleLinear()
        .range([0, visWidth]);
    
    const y = d3.scaleBand()
        .domain(bikeColor.domain())
        .range([0, visHeight])
        .padding(0.2);
    
    // create and add axes
    
    const xAxis = d3.axisBottom(x).tickSizeOuter(0);
    
    const xAxisGroup = g.append("g")
        .attr("transform", `translate(0, ${visHeight})`);
    
    xAxisGroup.append("text")
        .attr("x", visWidth / 2)
        .attr("y", 40)
        .attr("fill", "black")
        .attr("text-anchor", "middle")
        .text("Count");
    
    const yAxis = d3.axisLeft(y);
    
    const yAxisGroup = g.append("g")
        .call(yAxis)
        // remove baseline from the axis
        .call(g => g.select(".domain").remove());
      
    let barsGroup = g.append("g");
  
    function update(data) {
      
      // get the number of cars for each origin
      const bikeCounts = d3.rollup(
        data,
        group => group.length,
        d => d.bike
      );
  
      // update x scale
      x.domain([0, d3.max(bikeCounts.values())]).nice()
  
      // update x axis
  
      const t = svg.transition()
          .ease(d3.easeLinear)
          .duration(200);
  
      xAxisGroup
        .transition(t)
        .call(xAxis);
      
      // draw bars
      barsGroup.selectAll("rect")
        .data(bikeCounts, ([bike, count]) => bike)
        .join("rect")
          .attr("fill", ([bike, count]) => bikeColor(bike))
          .attr("height", y.bandwidth())
          .attr("x", 0)
          .attr("y", ([bike, count]) => y(bike))
        .transition(t)
          .attr("width", ([bike, count]) => x(count))
    }
    
    return Object.assign(svg.node(), { update });;
  }

  function init() {
    const scatter = brushableScatterplot();
    const bar = barChart();

    // update the bar chart when the scatterplot
    // selection changes
    d3.select(scatter).on('input', () => {
      bar.update(scatter.value);
    });

    // intial state of bar chart
    bar.update(scatter.value);
  }
  // load chart when window is loaded
  window.onload = init;