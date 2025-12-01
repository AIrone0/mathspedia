import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { DependencyNode } from '../types';
import { GitBranch } from 'lucide-react';

interface DependencyGraphProps {
  nodes: DependencyNode[];
  onNodeClick: (nodeName: string) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  year: number;
  author?: string;
  source?: string;
  comment?: string;
  original: DependencyNode;
  x?: number;
  y?: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({ nodes, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Process data for D3
  const { graphNodes, graphLinks } = useMemo(() => {
    const gNodes: GraphNode[] = nodes.map(n => ({
      id: n.id,
      name: n.name,
      year: n.year,
      author: n.author,
      source: n.source,
      comment: n.comment,
      original: n,
    }));

    const gLinks: GraphLink[] = [];
    nodes.forEach(n => {
      n.parentIds.forEach(pid => {
        // Only add link if parent exists in our dataset
        if (gNodes.find(gn => gn.id === pid)) {
          gLinks.push({ source: pid, target: n.id });
        }
      });
    });

    return { graphNodes: gNodes, graphLinks: gLinks };
  }, [nodes]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || graphNodes.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = 400; // Fixed height for the dashboard timeline section
    // Increased right margin significantly to accommodate long theorem names at the end of the timeline
    const margin = { top: 60, right: 200, bottom: 40, left: 40 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    // 1. Scales
    const minYear = d3.min(graphNodes, d => d.year) || 0;
    const maxYear = d3.max(graphNodes, d => d.year) || 2024;
    
    // Add buffer to domain so first/last nodes aren't on the absolute edge of the drawing area
    const timeScale = d3.scaleLinear()
      .domain([minYear - 50, maxYear + 20]) 
      .range([margin.left, width - margin.right]);

    // 2. Simulation (Restricted Force Layout)
    // We want X to be strictly tied to time, Y to be distributed to avoid collision.
    const simulation = d3.forceSimulation<GraphNode>(graphNodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(graphLinks).id(d => d.id).strength(0.5))
      .force("charge", d3.forceManyBody().strength(-300))
      // Increased collision radius to prevent bunching
      .force("collide", d3.forceCollide(60)) 
      .force("x", d3.forceX<GraphNode>(d => timeScale(d.year)).strength(2.5)) // Stronger pull to time
      .force("y", d3.forceY(height / 2).strength(0.15));

    // 3. Tooltip
    const tooltip = d3.select(containerRef.current)
      .append("div")
      .attr("class", "absolute pointer-events-none bg-black border border-term-fg/50 px-2 py-1 text-xs text-term-fg font-mono z-50 max-w-[250px]")
      .style("opacity", 0)
      .style("transition", "opacity 0.15s");

    // 4. Drawing Elements
    const g = svg.append("g");

    // Axis
    const axis = d3.axisTop(timeScale).tickFormat(d3.format("d")).ticks(10);
    g.append("g")
      .attr("class", "text-term-dim")
      .attr("transform", `translate(0, ${margin.top})`)
      .call(axis)
      .selectAll("text")
      .attr("fill", "#003b00")
      .style("font-family", "monospace");
      
    g.selectAll(".domain").attr("stroke", "#003b00");
    g.selectAll(".tick line").attr("stroke", "#003b00");

    // Links
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(graphLinks)
      .enter().append("line")
      .attr("stroke", "#003b00")
      .attr("stroke-width", 1.5);

    // Nodes Group
    const node = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(graphNodes)
      .enter().append("g")
      .attr("cursor", "pointer")
      .on("click", (event, d) => onNodeClick(d.name))
      .on("mouseenter", (event, d) => {
        // Build tooltip with year and comment
        const yearText = `<span style="color: #00ff41">${d.year}</span>`;
        const commentText = d.comment ? `<br/>${d.comment}` : '';
        tooltip
          .html(yearText + commentText)
          .style("left", `${event.offsetX + 10}px`)
          .style("top", `${event.offsetY - 10}px`)
          .style("opacity", 1);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", `${event.offsetX + 10}px`)
          .style("top", `${event.offsetY - 10}px`);
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0);
      });

    // Node Circles
    node.append("circle")
      .attr("r", 6)
      .attr("fill", "#000")
      .attr("stroke", "#00ff41")
      .attr("stroke-width", 2);

    // Labels with Logic for positioning
    node.each(function(d, i) {
      const el = d3.select(this);
      // Alternate labels up/down to reduce collision
      const isUp = i % 2 === 0;
      // If node is extremely close to the right edge (past margin buffer), anchor end
      const isFarRight = timeScale(d.year) > (width - 180); 
      const textAnchor = isFarRight ? "end" : "start";
      const xOffset = isFarRight ? -12 : 12;

      // Name
      el.append("text")
        .text(d.name)
        .attr("x", xOffset)
        .attr("y", isUp ? -10 : 20)
        .attr("text-anchor", textAnchor)
        .attr("fill", "#00ff41")
        .attr("font-size", "12px")
        .style("text-shadow", "0px 0px 4px #000"); // Shadow for readability over lines

      // Source (italic), Year, Author
      const metaText = el.append("text")
        .attr("x", xOffset)
        .attr("y", isUp ? -22 : 32)
        .attr("text-anchor", textAnchor)
        .attr("fill", "#008F11")
        .attr("font-size", "10px");
      
      // Add source in italic if available
      if (d.source) {
        metaText.append("tspan")
          .text(d.source)
          .attr("font-style", "italic");
      }
      
      // Add author if available
      if (d.author) {
        if (d.source) {
          metaText.append("tspan").text(", ");
        }
        metaText.append("tspan").text(d.author);
      }
    });

    // Simulation Tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as GraphNode).x!)
        .attr("y1", d => (d.source as GraphNode).y!)
        .attr("x2", d => (d.target as GraphNode).x!)
        .attr("y2", d => (d.target as GraphNode).y!);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    // Cleanup tooltip on unmount/re-render
    return () => {
      tooltip.remove();
    };

  }, [graphNodes, graphLinks, onNodeClick]); // Removed width dependency to prevent loop, relied on ref read inside effect

  return (
    <div ref={containerRef} className="w-full h-[400px] bg-[#020202] relative overflow-hidden">
      <div className="flex items-center space-x-2 bg-term-dim/20 border-b border-term-dim p-1">
        <span className="text-term-warn"><GitBranch size={14} /></span>
        <h3 className="font-bold text-term-fg uppercase tracking-widest text-sm">DEPENDENCY_TREE</h3>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default DependencyGraph;