// Set x & y axis defaults
var currentXAxis = "poverty";
var currentYAxis = "healthcare";

// Function for updating x axis
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// Function for updating x scale
function xScale(healthdata, currentXAxis, chartWidth) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(healthdata, d => d[currentXAxis]) * .8,
            d3.max(healthdata, d => d[currentXAxis]) * 1.1])
        .range([0, chartWidth]);
    return xLinearScale;
}

// Function for updating y axis
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// Function for updating y scale
function yScale(healthdata, currentYAxis, chartHeight) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(healthdata, d => d[currentYAxis]) * .8,
            d3.max(healthdata, d => d[currentYAxis]) * 1.1])
        .range([chartHeight, 0]);
    return yLinearScale;
}

// Function for updating circles & transition
function renderCircles(circlesGroup, newXScale, newYScale, currentXAxis, currentYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[currentXAxis]))
        .attr("cy", d => newYScale(d[currentYAxis]));
    return circlesGroup;
}
// Function for updating text in circles & transition
function renderText(circletextGroup, newXScale, newYScale, currentXAxis, currentYAxis) {
    circletextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[currentXAxis]))
        .attr("y", d => newYScale(d[currentYAxis]));
    return circletextGroup;
}
// Function for updating circles with tooltip.
function updateToolTip(currentXAxis, currentYAxis, circlesGroup, textGroup) {
    // X Axis
    if (currentXAxis === "poverty") {
        var xlabel = "Poverty: ";
    } else if (currentXAxis === "income") {
        var xlabel = "Median Income: "
    } else {
        var xlabel = "Age: "
    }
    // Y Axis
    if (currentYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare: ";
    } else if (currentYAxis === "smokes") {
        var ylabel = "Smokers: "
    } else {
        var ylabel = "Obesity: "
    }
    // Define tooltip.
    var toolTip = d3.tip()
        .offset([120, -60])
        .attr("class", "d3-tip")
        .html(function(d) {
            if (currentXAxis === "age") {
                // Display age
                return (`${d.state}<hr>${xlabel} ${d[currentXAxis]}<br>${ylabel}${d[currentYAxis]}%`);
                } else if (currentXAxis !== "poverty" && currentXAxis !== "age") {
                // Display Income
                return (`${d.state}<hr>${xlabel}$${d[currentXAxis]}<br>${ylabel}${d[currentYAxis]}%`);
                } else {
                // Display Poverty
                return (`${d.state}<hr>${xlabel}${d[currentXAxis]}%<br>${ylabel}${d[currentYAxis]}%`);
                }      
        });

    circlesGroup.call(toolTip);
    // Mouseover event listener for tool tip.
    circlesGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    textGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    return circlesGroup;
}
function makeResponsive() {
        var svgArea = d3.select("#scatter").select("svg");
    // Clear SVG.
    if (!svgArea.empty()) {
        svgArea.remove();
    }
    //SVG params.
    var svgHeight = window.innerHeight/1.4;
    var svgWidth = window.innerWidth/2.2;
    // Margins.
    var margin = {
        top: 50,
        right: 50,
        bottom: 100,
        left: 80
    };
    // Chart area including margins.
    var chartHeight = svgHeight - margin.top - margin.bottom;
    var chartWidth = svgWidth - margin.left - margin.right;
    // Create SVG wrapper to hold chart
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
    // Append SVG
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    d3.csv("assets/data/data.csv").then(function(healthData, err) {
        if (err) throw err;
            healthData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.smokes = +data.smokes;
            data.income = +data.income;
            data.obesity = data.obesity;
        });

        // Create x & y linear scales
        var xLinearScale = xScale(healthData, currentXAxis, chartWidth);
        var yLinearScale = yScale(healthData, currentYAxis, chartHeight);
        // Create initial axis functions
        var bottomAxis =d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);
        // Append x axis
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);
        // Append y axis
        var yAxis = chartGroup.append("g")
            .call(leftAxis);
        // Set data for circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData);
        // Bind data
        var elemEnter = circlesGroup.enter();
        // Create circles
        var circle = elemEnter.append("circle")
            .attr("cx", d => xLinearScale(d[currentXAxis]))
            .attr("cy", d => yLinearScale(d[currentYAxis]))
            .attr("r", 15)
            .classed("stateCircle", true);
        // Create circle text
        var circleText = elemEnter.append("text")            
            .attr("x", d => xLinearScale(d[currentXAxis]))
            .attr("y", d => yLinearScale(d[currentYAxis]))
            .attr("dy", ".35em") 
            .text(d => d.abbr)
            .classed("stateText", true);
        // Update tool tip
        var circlesGroup = updateToolTip(currentXAxis, currentYAxis, circle, circleText);
        // Add x labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty")
            .classed("active", true)
            .text("In Poverty (%)");
        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Age (Median)");
        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income")
            .classed("inactive", true)
            .text("Household Income (Median)");
        // Add y labels
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
        var healthcareLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 40 - margin.left)
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");
        var smokesLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 20 - margin.left)
            .attr("dy", "1em")
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");
        var obeseLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 0 - margin.left)
            .attr("dy", "1em")
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("Obese (%)");
        // X label event listener
        xLabelsGroup.selectAll("text")
            .on("click", function() {
                // Grab selected label
                currentXAxis = d3.select(this).attr("value");
                // Update xLinearScale
                xLinearScale = xScale(healthData, currentXAxis, chartWidth);
                // Render xAxis
                xAxis = renderXAxes(xLinearScale, xAxis);
                // Switch active/inactive labels
                if (currentXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (currentXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                // Update circles with x value
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, currentXAxis, currentYAxis);
                // Update tool tip with info
                circlesGroup = updateToolTip(currentXAxis, currentYAxis, circle, circleText);
                // Update circles text with value
                circleText = renderText(circleText, xLinearScale, yLinearScale, currentXAxis, currentYAxis);
            });
        // Y Label event listener
        yLabelsGroup.selectAll("text")
            .on("click", function() {
                // Grab selected label
                currentYAxis = d3.select(this).attr("value");
                // Update yLinearScale
                yLinearScale = yScale(healthData, currentYAxis, chartHeight);
                // Update yAxis
                yAxis = renderYAxes(yLinearScale, yAxis);
                // Changes classes to change bold text
                if (currentYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (currentYAxis === "smokes"){
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
                // Update circles with y value
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, currentXAxis, currentYAxis);
                // Update tool tips with info
                circlesGroup = updateToolTip(currentXAxis, currentYAxis, circle, circleText);
                // Update circles text with value
                circleText = renderText(circleText, xLinearScale, yLinearScale, currentXAxis, currentYAxis);
            });
    }).catch(function(err) {
        console.log(err);
    });
}
makeResponsive();
d3.select(window).on("resize", makeResponsive);