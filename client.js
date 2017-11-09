document.addEventListener('DOMContentLoaded', () => {
  // Set dimensions of chart
  const graphHeight = 350;
  const graphWidth = 350;

  // Set margin for x/y axis
  const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50,
  };

  /*
   * render
   *
   * arguments
   * ---------
   * point1 - {x,y} - coordinates of min point
   * point2 - {x,y} - coordinates of max point
   * top - top coordinate edge
   * right - right coordinate edge
   * bottom - bottom coordinate edge
   * left - left coordinate edge
   *
   * return
   * ------
   * (none)
   */
  const render = (point1, point2, top, right, bottom, left) => {
    d3.selectAll('#line-plot > *').remove();
    // Map min/max x and y coordinates
    // to min/max pixels in chart
    const xRange = d3.scaleLinear()
                     .domain([left, right])
                     .range([0, graphWidth]);

    const yRange = d3.scaleLinear()
                     .domain([bottom, top])
                     .range([graphHeight, 0]);

    // D3 will automatically draw axes based on ranges
    const xAxis = d3.axisBottom(xRange);
    const yAxis = d3.axisLeft(yRange);

    // Find target svg element on the page and set it's dimensions
    const vis = d3.select('#line-plot')
                  .attr('width', graphWidth + margin.left + margin.right)
                  .attr('height', graphHeight + margin.top + margin.bottom);

    // Add the xAxis that d3 rendered and move it into position
    // The y position is based on where 0 lies in the y-range
    vis.append('svg:g')
       .attr('transform', `translate(${margin.left}, ${margin.top + yRange(0)})`)
       .call(xAxis);

    // Add the yAxis that d3 rendered and move it into position
    // The x position is based on where 0 lies in the x-range
    vis.append('svg:g')
       .attr('transform', `translate(${margin.left + xRange(0)}, ${margin.top})`)
       .call(yAxis);

    // Plot the line between the two points located at xMin and xMax
    vis.append('line')
       .style('stroke', 'red')
       .attr('transform', `translate(${margin.left}, ${margin.top})`)
       .attr('x1', xRange(point1.x))
       .attr('y1', yRange(point1.y))
       .attr('x2', xRange(point2.x))
       .attr('y2', yRange(point2.y));

    // Add axis labels
    vis.append('text')
       .text('x')
       .attr('x', margin.left + graphWidth + (margin.right / 2))
       .attr('y', margin.top + yRange(0));

    vis.append('text')
       .text('y')
       .attr('x', margin.left + xRange(0))
       .attr('y', margin.top / 2);
  };

  /*
   * calculateAttributes
   *
   * arguments
   * ---------
   * xMin - minimum x to draw
   * xMax - maximum x to draw
   * m - slope
   * b - y intercept
   *
   * return
   * ------
   * {
   *   point1, - First endpoint of the line
   *   point2, - Second endpoint of the line
   *   top,    - Top bound of grid
   *   right,  - Right bound of grid
   *   bottom, - Bottom bound of grid
   *   left,   - Left bound of grid
   * }
   */
  const calculateAttributes = (xMin, xMax, m, b) => {
    let point1;
    let point2;

    // If a vertical line, create custom points.
    // To keep a visual balance, try to
    // center the origin and the vertical line.
    // If x is zero, just draw the line from y = -100 to 100
    if (xMin === xMax) {
      point1 = {
        x: xMin,
        y: (-2 * xMin) || -100,
      };

      point2 = {
        x: xMax,
        y: (2 * xMax) || 100,
      };

    // If a non-vertical line just calculate y = mx + b
    } else {
      point1 = {
        x: xMin,
        y: (m * xMin) + b,
      };

      point2 = {
        x: xMax,
        y: (m * xMax) + b,
      };
    }

    // In order to make the graph look good with the labeled axes,
    // I calculate the bounding box that contains both points and the origin
    let left = Math.min(0, point1.x, point2.x);
    let right = Math.max(0, point1.x, point2.x);
    let bottom = Math.min(0, point1.y, point2.y);
    let top = Math.max(0, point1.y, point2.y);

    // In order to keep the unit-grid property (square pixels),
    // calculate the difference in height and width
    // and add half of the difference to each end of the
    // shortest dimension.
    const width = right - left;
    const height = top - bottom;

    if (width > height) {
      const padding = (width - height) / 2;
      bottom -= padding;
      top += padding;
    } else if (width < height) {
      const padding = (height - width) / 2;
      left -= padding;
      right += padding;
    }

    return {
      point1,
      point2,
      top,
      right,
      bottom,
      left,
    };
  };

  // Cache references to DOM elements
  const xMinEl = document.querySelector('#x-min');
  const xMaxEl = document.querySelector('#x-max');
  const slopeEl = document.querySelector('#slope');
  const interceptEl = document.querySelector('#intercept');
  const errorEl = document.querySelector('#error-message');
  const autoPlotCheckbox = document.querySelector('#auto-plot');

  /*
   * displayChart
   *
   * Fetches inputs from form
   * Error checks inputs
   * Calculates graph attributes
   * Renders graph with attributes
   */
  const displayChart = () => {
    const xMin = parseFloat(xMinEl.value);
    const xMax = parseFloat(xMaxEl.value);
    const slope = parseFloat(slopeEl.value);
    const intercept = parseFloat(interceptEl.value);

    if (isNaN(xMin) || isNaN(xMax)) {
      errorEl.innerText = 'All inputs must be numbers';
      return;
    }

    if (xMin > xMax) {
      errorEl.innerText = 'Minimum x has to be less than Maximum x';
      return;
    }

    errorEl.innerText = '';

    // Calculate the values render needs to create the chart
    const {
      point1, point2, top, right, bottom, left,
    } = calculateAttributes(xMin, xMax, slope, intercept);

    // Use d3 to render the chart
    render(point1, point2, top, right, bottom, left);
  };

  // Plot button clicked
  document.querySelector('#param-submit').addEventListener('click', () => {
    displayChart();
  });

  // Attempt an auto plot
  const attemptAutoPlot = () => {
    // Only automatically plot if the box is checked
    if (autoPlotCheckbox.checked) {
      displayChart();
    };
  }

  // Attempt to automatically refresh the graph when any param changes
  document.querySelectorAll('.param').forEach((input) => {
    input.addEventListener('change', attemptAutoPlot);
    input.addEventListener('keyup', attemptAutoPlot);
    input.addEventListener('paste', attemptAutoPlot);
  });

  // Do the first render of the plot with default values
  displayChart();
});
