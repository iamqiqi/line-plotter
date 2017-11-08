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
    vis.append("line")
      .style("stroke", "red")
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr("x1", xRange(point1.x))
      .attr("y1", yRange(point1.y))
      .attr("x2", xRange(point2.x))
      .attr("y2", yRange(point2.y));
  };

  const calculateAttributes = (xMin, xMax, m, b) => {
    let point1, point2;

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
        y: m * xMin + b,
      };

      point2 = {
        x: xMax,
        y: m * xMax + b,
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
    // shortest dimention.
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
    }
  }

  const displayChart = (xMin, xMax, m, b) => {

    // Calculate the values render needs to create the chart
    const {
      point1, point2, top, right, bottom, left
    } = calculateAttributes(xMin, xMax, m, b);

    // Use d3 to render the chart
    render(point1, point2, top, right, bottom, left);
  }

  displayChart(-4, -4, 9, -10);
});
