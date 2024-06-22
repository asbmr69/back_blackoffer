// src/components/Chart.js

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import 'C://Users/asbmr/Desktop/blackcoffer/frontend/dashboard/src/index.css';


const Chart = ({ data }) => {
    const chartRef = useRef();
    const [activeSubgroups, setActiveSubgroups] = useState({
        intensity: true,
        likelihood: true,
        relevance: true
    });
    const [filters, setFilters] = useState({
        endYear: '',
        topics: '',
        sector: '',
        region: '',
        pest: '',
        source: '',
        swot: '',
        country: ''
    });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prevFilters => ({
            ...prevFilters,
            [name]: value
        }));
    };

    const filteredData = data.filter(item => {
        return (!filters.endYear || item.end_year.includes(filters.endYear)) &&
               (!filters.topics || item.topic.includes(filters.topics)) &&
               (!filters.sector || item.sector.includes(filters.sector)) &&
               (!filters.region || item.region.includes(filters.region)) &&
               (!filters.pest || item.pestle.includes(filters.pest)) &&
               (!filters.source || item.source.includes(filters.source)) &&
               (!filters.swot || item.swot.includes(filters.swot)) &&
               (!filters.country || item.country.includes(filters.country));
    });

    const drawChart = useCallback(() => {
        const svg = d3.select(chartRef.current);
        svg.selectAll('*').remove(); // Clear previous contents

        const width = 1000;
        const height = 600;
        const margin = { top: 20, right: 30, bottom: 100, left: 60 };

        svg.attr('width', width)
           .attr('height', height);

        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const g = svg.append('g')
                     .attr('transform', `translate(${margin.left},${margin.top})`);

        const subgroups = ['intensity', 'likelihood', 'relevance'];
        const groups = filteredData.map(d => d._id);

        const x0 = d3.scaleBand()
                     .domain(groups)
                     .range([0, chartWidth])
                     .padding(0.1);

        const x1 = d3.scaleBand()
                     .domain(subgroups)
                     .range([0, x0.bandwidth()])
                     .padding(0.05);

        const y = d3.scaleLinear()
                    .domain([0, d3.max(filteredData, d => Math.max(d.intensity, d.likelihood, d.relevance))])
                    .nice()
                    .range([chartHeight, 0]);

        const color = d3.scaleOrdinal()
                        .domain(subgroups)
                        .range(['#6b486b', '#ff8c00', '#a05d56']);

        // Add X-axis
        g.append('g')
         .attr('class', 'x-axis')
         .attr('transform', `translate(0,${chartHeight})`)
         .call(d3.axisBottom(x0).tickFormat((d, i) => i % Math.ceil(groups.length / 50) === 0 ? d.slice(0, 4) : ''))
         .selectAll("text")
         .attr("transform", "translate(-10,0)rotate(-45)")
         .style("text-anchor", "end");

        // Add Y-axis
        g.append('g')
         .attr('class', 'y-axis')
         .call(d3.axisLeft(y));

        // Create a tooltip
        const tooltip = d3.select('body').append('div')
                          .attr('class', 'tooltip')
                          .style('opacity', 0);

        // Add bars
        const bars = g.selectAll('.bar-group')
                      .data(filteredData)
                      .enter()
                      .append('g')
                      .attr('transform', d => `translate(${x0(d._id)},0)`);

        bars.selectAll('rect')
            .data(d => subgroups.map(key => ({ key, value: d[key], country: d.country, region: d.region, city: d.city })))
            .enter()
            .append('rect')
            .attr('class', d => `bar ${d.key}`)
            .attr('x', d => x1(d.key))
            .attr('y', y(0))
            .attr('width', x1.bandwidth())
            .attr('height', 0)
            .attr('fill', d => color(d.key))
            .style('opacity', d => activeSubgroups[d.key] ? 1 : 0)
            .on('mouseover', (event, d) => {
                tooltip.transition()
                       .duration(200)
                       .style('opacity', .9);
                tooltip.html(`${d.key}: ${d.value}<br/>Country: ${d.country}<br/>Region: ${d.region}`)
                       .style('left', (event.pageX + 5) + 'px')
                       .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', () => {
                tooltip.transition()
                       .duration(500)
                       .style('opacity', 0);
            })
            .transition()
            .duration(800)
            .attr('y', d => y(d.value))
            .attr('height', d => chartHeight - y(d.value));

        // Add legend
        const legend = svg.append('g')
                          .attr('transform', `translate(${width - margin.right - 120}, ${margin.top})`);

        legend.selectAll('rect')
              .data(subgroups)
              .enter()
              .append('rect')
              .attr('x', 0)
              .attr('y', (d, i) => i * 20)
              .attr('width', 10)
              .attr('height', 10)
              .attr('fill', d => color(d))
              .on('click', (event, d) => {
                  setActiveSubgroups(prevState => ({
                      ...prevState,
                      [d]: !prevState[d]
                  }));
              });

        legend.selectAll('text')
              .data(subgroups)
              .enter()
              .append('text')
              .attr('x', 20)
              .attr('y', (d, i) => i * 20 + 9)
              .text(d => d);
    }, [filteredData, activeSubgroups]);

    useEffect(() => {
        if (filteredData.length > 0) {
            drawChart();
        }
    }, [filteredData, activeSubgroups, drawChart]);

    return (
        <div>
            <div className="filters">
                
                <label>
                    Topics:
                    <input type="text" name="topics" value={filters.topics} onChange={handleFilterChange} />
                </label>
                <label>
                    Sector:
                    <input type="text" name="sector" value={filters.sector} onChange={handleFilterChange} />
                </label>
                <label>
                    Region:
                    <input type="text" name="region" value={filters.region} onChange={handleFilterChange} />
                </label>
                <label>
                    PEST:
                    <input type="text" name="pest" value={filters.pest} onChange={handleFilterChange} />
                </label>
                <label>
                    Source:
                    <input type="text" name="source" value={filters.source} onChange={handleFilterChange} />
                </label>
                
                <label>
                    Country:
                    <input type="text" name="country" value={filters.country} onChange={handleFilterChange} />
                </label>
            </div>
            <svg ref={chartRef}></svg>
        </div>
    );
};

export default Chart;
