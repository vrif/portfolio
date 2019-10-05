/*
Author: Harry Yau
Date: Oct 2, 2019
Updated: Oct 4, 2019

D3 script to recreate the keeling curve chart.

*/

//set the dimensions and margins of the graph
var margin = {top: 50, right: 5, bottom: 30, left: 60},
    width = 560 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var buffer = 10;

// set the font sizes
var font_size_title = 20;
var font_size_label = 15;
var font_size_tick = 12;
var font_size_legend = 12;



//append the svg object to the body of the page
var svg = d3.select('#keeling_graph')
    .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
    .append('g')
        .attr('transform', 
        'translate(' + margin.left + ',' + margin.top + ')'
        );

//read the data

var url = 'https://raw.githubusercontent.com/vrif/vrif.github.io/master/_data/keeling_data.csv';

d3.csv(url)
    .then(function(data) { 
        
        //Parse date using for-each loop
        data.forEach(function(d){
            d.date = d3.timeParse("%Y-%m-%d")(d.ds)
        });

        var split_index = 735
        obs_data = data.slice(0, split_index+1)
        fcst_data = data.slice(split_index+1, data.length+1)

        // X axis
        var x = d3.scaleTime()
            .domain(d3.extent(data, function(d) {return d.date;} ))
            .range([0, width]);

        svg.append('g')
            .attr('transform', 'translate(0,' + (height - font_size_tick) + ')')
            .style('font-size', font_size_tick)
            .call(d3.axisBottom(x));

        svg.append('text')
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
            .style('text-anchor', 'middle')
            .attr('font-size', font_size_label)
            .attr('font-weight', 'bold')
            .text('Year');

        // Y axis
        var y = d3.scaleLinear()
            .domain( [ (parseInt(d3.min(data, function(d) {return d.yhat;})) - buffer), 
            (  parseInt(d3.max(data, function(d) {return d.yhat_upper;})) + buffer )] )
            .range([height, 0]);
        svg.append('g')
            .attr('transform', 'translate(0,' + (-font_size_tick) + ')')
            .style('font-size', font_size_tick)
            .call(d3.axisLeft(y));

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0- (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .attr('font-size', font_size_label)
            .attr('font-weight', 'bold')
            .text('CO2 Concentration (ppm)');

        // Title
        svg.append('text')
            .attr('x', (width/2))
            .attr('y', 0 - (margin.top / 2))
            .style('text-anchor', 'middle')
            .attr('font-size', font_size_title)
            .attr('font-weight', 'bold')
            .text('Monthly Average CO2 Concentration');

        // Add the line for observation
        svg.append('path')
            .datum(obs_data)
            .attr('fill', 'none')
            .attr('stroke', 'black')
            .attr('stroke-width', 1.5)
            .attr('d', d3.line()
                .x(function(d) {return x(d.date); } )
                .y(function(d) {return y(d.yhat); } )
            );

        // Confidence Interval. Filling it between two areas.
        svg.append('path')
            .datum(fcst_data)
            .attr('fill', 'lightcoral')
            .attr('fill-opacity', 0.5)
            .attr('stroke', 'none')
            .attr('d', d3.area()
                .x(function(d) { return x(d.date);} )
                .y0(function(d) {return y(d.yhat_upper); })
                .y1(function(d) {return y(d.yhat_lower); })
            )

        // Add the line for forecast
        svg.append('path')
            .datum(fcst_data)
            .attr('fill', 'none')
            .attr('stroke', 'red')
            .attr('stroke-dasharray', '4 4')
            .attr('stroke-width', 1.5)
            .attr('d', d3.line()
                .x(function(d) {return x(d.date); } )
                .y(function(d) {return y(d.yhat); } )
            );
        
        // Legend
        var legend_keys = ['Projected', 'Observed', '95% Confidence Interval']
        var color_scale = ['Red', 'Black', 'lightcoral'];
        var stroke_width_keys = [1.5, 1.5, 14];
        var dasharray_keys = ['4 4', 'None', 'None'];
        var fill_opacity_keys = [1, 1, 0.5]
        var width_line = 30;


        //Create the Legend SVG
        var lineLegend = svg.selectAll(".lineLegend")
            .data(legend_keys)
            .enter()
            .append("g")
            .attr("class","lineLegend")
            .attr("transform", function (d,i) {
                    return "translate(20," + (i*20)+")";
            });

        // Append text
        lineLegend.append("text")
            .text(function (d) {return d;})
            .attr('font-size', font_size_legend)
            .attr("transform", "translate(" + (width_line + 5) + ", 4)"); //align texts with boxes
        
        // Append line
        lineLegend.append('line')
            .attr("stroke", function (d, i) {return color_scale[i]; })
            .attr('stroke-width', function (d, i) {return stroke_width_keys[i]; })
            .attr('stroke-dasharray', function (d, i) {return dasharray_keys[i]; })
            .attr('stroke-opacity', function(d,i) {return fill_opacity_keys[i];} )
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', width_line)
            .attr('y2', 0)
    
    })