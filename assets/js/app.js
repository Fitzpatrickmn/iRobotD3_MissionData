// Set up SVG definitions
let svgWidth = 1160;
let svgHeight = 840;

// set up borders in svg
let margin = {
  top: 20,
  right: 40,
  bottom: 200,
  left: 100
};

// calculate chart height and width
let width = svgWidth - margin.right - margin.left;
let height = svgHeight - margin.top - margin.bottom;

// append a div class to the scatter element
let chart = d3.select('#scatter')
  .append('div')
  .classed('chart', true);

//append an svg element to the chart 
let svg = chart.append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

//append an svg group
let chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);

//initial parameters; x and y axis
let chosenXAxis = 'robotCount';
let chosenYAxis = 'robotCount';

//a function for updating the x-scale variable upon click of label
function xScale(robotData, chosenXAxis) {
  //scales
  let xLinearScale = d3.scaleLinear()
    .domain([d3.min(robotData, d => d[chosenXAxis]) * 0.8,
    d3.max(robotData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);

  return xLinearScale;
}
//a function for updating y-scale variable upon click of label
function yScale(robotData, chosenYAxis) {
  //scales
  let yLinearScale = d3.scaleLinear()
    .domain([d3.min(robotData, d => d[chosenYAxis]) * 0.8,
    d3.max(robotData, d => d[chosenYAxis]) * 1.2])
    .range([height, 0]);

  return yLinearScale;
}
//a function for updating the xAxis upon click
function renderXAxis(newXScale, xAxis) {
  let bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(2000)
    .call(bottomAxis);

  return xAxis;
}

//function used for updating yAxis variable upon click
function renderYAxis(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(2000)
    .call(leftAxis);

  return yAxis;
}

//a function for updating the circles with a transition to new circles 
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(2000)
    .attr('cx', data => newXScale(data[chosenXAxis]))
    .attr('cy', data => newYScale(data[chosenYAxis]))

  return circlesGroup;
}

//function for updating STATE labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  textGroup.transition()
    .duration(2000)
    .attr('x', d => newXScale(d[chosenXAxis]))
    .attr('y', d => newYScale(d[chosenYAxis]));

  return textGroup
}
//function to stylize x-axis values for tooltips
function styleX(value, chosenXAxis) {

  //style based on variable
  //robotCount
  if (chosenXAxis === 'robotCount') {
    return `${value}`;
  }
  //household missingMssn
  else if (chosenXAxis === 'missingMssn') {
    return `${value}`;
  }
  else {
    return `${value}`;
  }
}

//funtion for updating circles group
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  //robotCount
  if (chosenXAxis === 'robotCount') {
    var xLabel = 'Robot Count:';
  }
  //missingMssn
  else if (chosenXAxis === 'missingMssn') {
    var xLabel = 'Missing Missions:';
  }
  //missionCount
  else {
    var xLabel = 'Mission Count:';
  }
  //Y label
  //robotCount
  if (chosenYAxis === 'robotCount') {
    var yLabel = "Robot Count:"
  }
  else if (chosenYAxis === 'missingMssn') {
    var yLabel = 'Number of Missing Missions:';
  }
  //smoking
  else {
    var yLabel = 'Mission Count:';
  }

  //create tooltip
  var toolTip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-8, 0])
    .html(function (d) {
      return (`${d.region}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  //add
  circlesGroup.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

  return circlesGroup;
}
//retrieve data
d3.csv('./assets/data/region_filtered_data.csv').then(function (robotData) {

  console.log(robotData);

  //Parse data
  robotData.forEach(function (data) {
    data.missingMssn = +data.missingMssn;
    data.missionCount = +data.missionCount;
    data.robotCount = +data.robotCount;
  });

  //create linear scales
  var xLinearScale = xScale(robotData, chosenXAxis);
  var yLinearScale = yScale(robotData, chosenYAxis);

  //create x axis
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  //append X
  var xAxis = chartGroup.append('g')
    .classed('x-axis', true)
    .attr('transform', `translate(0, ${height})`)
    .call(bottomAxis);

  //append Y
  var yAxis = chartGroup.append('g')
    .classed('y-axis', true)
    //.attr
    .call(leftAxis);

  //append Circles
  var circlesGroup = chartGroup.selectAll('circle')
    .data(robotData)
    .enter()
    .append('circle')
    .classed('stateCircle', true)
    .attr('cx', d => xLinearScale(d[chosenXAxis]))
    .attr('cy', d => yLinearScale(d[chosenYAxis]))
    .attr('r', 20)
    .attr('opacity', '.5');

  //append Initial Text
  var textGroup = chartGroup.selectAll('.stateText')
    .data(robotData)
    .enter()
    .append('text')
    .classed('stateText', true)
    .attr('x', d => xLinearScale(d[chosenXAxis]))
    .attr('y', d => yLinearScale(d[chosenYAxis]))
    .attr('dy', 3)
    .attr('font-size', '7px')
    .text(function (d) { return d.region });

  //create a group for the x axis labels
  var xLabelsGroup = chartGroup.append('g')
    .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

  var robotCountLabelX = xLabelsGroup.append('text')
    .classed('aText', true)
    .classed('active', true)
    .attr('x', 0)
    .attr('y', 20)
    .attr('value', 'robotCount')
    .text('Robot Count');

  var missionCountLabelX = xLabelsGroup.append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 40)
    .attr('value', 'missionCount')
    .text('Mission Count');

  var missingMssnLabelX = xLabelsGroup.append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 60)
    .attr('value', 'missingMssn')
    .text('Missing Missions')

  //create a group for Y labels
  var yLabelsGroup = chartGroup.append('g')
    .attr('transform', `translate(${0 - margin.left / 4}, ${height / 2})`);

  var robotCountLabelY = yLabelsGroup.append('text')
    .classed('aText', true)
    .classed('active', true)
    .attr('x', 0)
    .attr('y', 0 - 20)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'robotCount')
    .text('Robot Count');

  var missionCountLabelY = yLabelsGroup.append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 0 - 40)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'missionCount')
    .text('Mission Count');

  var missingMssnLabelY = yLabelsGroup.append('text')
    .classed('aText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 0 - 60)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'missingMssn')
    .text('Missing Missions');

  //update the toolTip
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  //x axis event listener
  xLabelsGroup.selectAll('text')
    .on('click', function () {
      var value = d3.select(this).attr('value');

      if (value != chosenXAxis) {

        //replace chosen x with a value
        chosenXAxis = value;

        //update x for new data
        xLinearScale = xScale(robotData, chosenXAxis);

        //update x 
        xAxis = renderXAxis(xLinearScale, xAxis);

        //upate circles with a new x value
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update text 
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update tooltip
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        //change of classes changes text
        if (chosenXAxis === 'robotCount') {
          robotCountLabelX.classed('active', true).classed('inactive', false);
          missionCountLabelX.classed('active', false).classed('inactive', true);
          missingMssnLabelX.classed('active', false).classed('inactive', true);
        }
        else if (chosenXAxis === 'missionCount') {
          robotCountLabelX.classed('active', false).classed('inactive', true);
          missionCountLabelX.classed('active', true).classed('inactive', false);
          missingMssnLabelX.classed('active', false).classed('inactive', true);
        }
        else {
          robotCountLabelX.classed('active', false).classed('inactive', true);
          missionCountLabelX.classed('active', false).classed('inactive', true);
          missingMssnLabelX.classed('active', true).classed('inactive', false);
        }
      }
    });
  //y axis lables event listener
  yLabelsGroup.selectAll('text')
    .on('click', function () {
      var value = d3.select(this).attr('value');

      if (value != chosenYAxis) {
        //replace chosenY with value  
        chosenYAxis = value;

        //update Y scale
        yLinearScale = yScale(robotData, chosenYAxis);

        //update Y axis 
        yAxis = renderYAxis(yLinearScale, yAxis);

        //Udate CIRCLES with new y
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update TEXT with new Y values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update tooltips
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        //Change of the classes changes text
        if (chosenYAxis === 'missingMssn') {
          missingMssnLabelY.classed('active', true).classed('inactive', false);
          missionCountLabelY.classed('active', false).classed('inactive', true);
          robotCountLabelY.classed('active', false).classed('inactive', true);
        }
        else if (chosenYAxis === 'missionCount') {
          missingMssnLabelY.classed('active', false).classed('inactive', true);
          missionCountLabelY.classed('active', true).classed('inactive', false);
          robotCountLabelY.classed('active', false).classed('inactive', true);
        }
        else {
          missingMssnLabelY.classed('active', false).classed('inactive', true);
          missionCountLabelY.classed('active', false).classed('inactive', true);
          robotCountLabelY.classed('active', true).classed('inactive', false);
        }
      }
    });
});