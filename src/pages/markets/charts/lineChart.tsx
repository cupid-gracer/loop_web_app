import React, {useEffect, useRef, useState} from "react";
import * as d3 from "d3";
import flatMap from "array.prototype.flatmap";
import "./lineStyle.scss";
import * as api from "../Api"


interface Props {
  pair:any,
  id:any,
  symbol:any
}

flatMap.shim();
const LineChart = ({ pair, id, symbol }: Props) => {
  const [loaded, setLoaded]  = useState(false);
  const [data, setData]  = useState([]);

  !loaded && api.getTokenChartData(pair)
  .then((d) => {
    setData(d)
    setLoaded(true)
  });



  useEffect(() => {
    function init() {
    if(data.length === 1 && loaded) {
      // Set ref data
      const dataRef = flatMap(data, (e) => e);

      // Get Values 
      const last = dataRef[0];
      const today = dataRef.pop();
      const week = ((today.price - last.price) / last.price * 100).toFixed(2);
      //console.log(week)
      
      var margin = {
        top: 0,
        right: 10,
        bottom: 30,
        left: 10
      };

      const width = 230;
      const height = 65 - margin.top - margin.bottom;
      
      const xScale = d3
        .scaleTime()
        .domain(d3.extent(dataRef, (d) => new Date(d.timestamp * 1000)))
        .range([height, width]);

      const yScale = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(data, (d) => d3.max(d.map((el) => el.price)))
        ])
        .range([width, height]);

      const line = d3
        .line()
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y));
      // .curve(d3.curveMonotoneX);

      const dataset = dataRef.map((d) => ({
        x: new Date(d.timestamp * 1000),
        y: d.price
      }));

      const svg = d3
        .select(`#canvas_${symbol}`)
        .attr("width", width)
        .attr("height", height + margin.bottom * 2)
        //.attr("transform", `translate(${margin.top}, ${margin.bottom})`)
        .attr("key", symbol)
        .attr("class", week < '0.01' ? `down` : 'up');

      svg.append("path").datum(dataset).attr("class", "line").attr("key", id).attr("d", line).attr("transform", `translate(${margin.bottom})`);
      //svg.exit().remove();
    }
  }
  init()
  }, [data]);
  return (
    <svg id={`canvas_${symbol}`} />
  );
}

export default LineChart
