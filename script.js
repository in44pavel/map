//data
const EducationData = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json",
CountyData = "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json"

//define dimensions of canvas
const
    width = 1200,
    height = 600,
    num = 5,// number of colors
    //http://colorbrewer2.org/?type=diverging&scheme=RdYlBu&n=6
    colorBlue5=['#ffffcc','#a1dab4','#41b6c4','#2c7fb8','#253494'];
//define geo path generator
const path = d3.geoPath();
 //set the tooltip
var tooltip =d3.select(".map")
      .append("div")
      .attr("class","tooltip")
      .attr("id","tooltip")
      .style('opacity', 0)
//Load the data
d3.queue()
    .defer(d3.json,EducationData)
    .defer(d3.json, CountyData)
    .await(ready);

function ready(err, data, us){
  if (err) throw err;

 var length= data.length;//EdData length=3142

 var mapData=data.map((d,i)=>{
     return d.bachelorsOrHigher;})

 var min=d3.min(mapData);//EdData % min ==2.6
 var max=d3.max(mapData);//EdData % max ==75.1

 //set the SVG element
const svgMap = d3.select(".map")
                  .append("svg")
                  .attr("width",width)
                  .attr("height", height)

//define legend
var legendThreshold=d3.scaleThreshold()
      .domain(((count)=>{var a=[];
  for(let i=1;i<count;i++){a.push(min+i* (max-min)/count);}
    return a})(num))
       .range(/*colorBlue5)*/d3.schemeBlues[num])

var legendX=d3.scaleLinear()
       .domain([min,max])
       .range([0,300])

var legendAxis= d3.axisRight(legendX)
       .tickSize(-10,)
       .tickValues(legendThreshold.domain())
       .tickFormat(d3.format('.0f'))


var legend = svgMap.append("g")
    //.attr("class", "legend")
    .attr("id", "legend")

legend.append("g")
    .selectAll("rect")
    .data(
       legendThreshold.range().map((col)=>{
    var d = legendThreshold.invertExtent(col);
    if (d[0] == null) d[0] = legendX.domain()[0];
    if (d[1] == null) d[1] = legendX.domain()[1];
    return d;
  })
     )
   .enter().append("rect")
        .style("fill", (d, i)=>{return legendThreshold(d[0])})
        .attr("x",0 )
        .attr("y",(d,i)=>{return legendX(d[0])+0})
        .attr ("width", 10)
        .attr ("height", (d,i)=>{return legendX(d[1]) - legendX(d[0])})
        .attr("transform", "translate("+1060+",100)");

  legend.append("g")
        .call(legendAxis)
        .attr("transform", "translate("+1070+",100)")
        .style("font-size","12px")
        .style("font-family","Della Respira")
        .style("font-weight","bold")
        .select(".domain")
        .remove();

  //append map
  svgMap.append('g')
      .attr('class', "counties")
       .selectAll("path")
      .data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
      .attr("class", "county")
      .attr("data-fips", (d)=>{return d.id})
      .attr("data-education", (d)=>{
        var result = data.filter((obj)=>{return obj.fips == d.id;});
        if(result[0]){return result[0].bachelorsOrHigher}
    return 0})
      .attr("fill", (d)=>{
        var result = data.filter((obj)=>{
          return obj.fips == d.id});
        if(result[0]){
          return legendThreshold(result[0].bachelorsOrHigher)}
      return legendThreshold(0)})
      .attr("d", path)
//insert toooltip
      .on('mouseover', (d)=>{
          tooltip.transition()
            .duration(200)
            .style("opacity",0.8)
          tooltip.html(()=>{
              var result = data.filter(
              (obj)=>{return obj.fips == d.id});
             if(result[0]){
              return result[0]['area_name'] + ', ' +
                result[0]['state'] + "<br>"+
                result[0].bachelorsOrHigher + '%'}
          return 0})

         .style("left", (d3.event.pageX + 10) + "px")
         .style("top", (d3.event.pageY - 28) + "px")
         .attr("data-education", ()=>{
        var result = data.filter((obj)=>{return obj.fips == d.id;});
        if(result[0]){return result[0].bachelorsOrHigher}
    return 0})

        })

          .on("mouseout", (d)=>{
            tooltip.transition()
              .duration(200)
              .style("opacity", 0)
              ;
          })

//show state border
svgMap.append("path")
      .datum(topojson.mesh(us, us.objects.states, (a, b)=>{
  return a !== b; }))
      .attr("class", "states")
      .attr("d", path);
}
