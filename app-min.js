L.mapbox.accessToken="pk.eyJ1IjoiZmVucmlzIiwiYSI6InRHbm4xbkEifQ.Q_qWH1M_NebCj3c6yiyXng";var h2o={};h2o.CALLBACK_URL="https://spreadsheets.google.com/feeds/cells/1SgQvKoejjnWaQhcwTP39EDYUOmPCTK9Pc8li9cuOLu8/od6/public/values?alt=json-in-script&callback=myCallback",h2o.SHEET="https://docs.google.com/spreadsheets/d/1SgQvKoejjnWaQhcwTP39EDYUOmPCTK9Pc8li9cuOLu8/edit?usp=sharing",h2o.DIMS={HEIGHT:300,WIDTH:300},h2o.MapDim=d3.select("#map"),h2o.DIMS.WIDE_WIDTH=h2o.MapDim.node().getBoundingClientRect().width,h2o.parseDate=d3.time.format("%m/%d/%Y"),h2o.weekOffset=-6048e5,h2o.weekAgo=new Date((new Date).getTime()+h2o.weekOffset),h2o.latest=h2o.weekAgo,h2o.ndx=crossfilter(),h2o.all=h2o.ndx.groupAll(),h2o.allDim=h2o.ndx.dimension(function(e){return e}),h2o.dateDim=h2o.ndx.dimension(function(e){return e.Date}),h2o.dateCount=h2o.dateDim.group().reduceCount(),h2o.dateChart=dc.barChart("#chart-event-date"),h2o.regionDim=h2o.ndx.dimension(function(e){return e.Region}),h2o.regionCount=h2o.regionDim.group().reduceCount(),h2o.regionChart=dc.rowChart("#chart-region-row"),h2o.monthDim=h2o.ndx.dimension(function(e){return e.Month}),h2o.monthCount=h2o.monthDim.group().reduceCount(),h2o.monthChart=dc.rowChart("#chart-month-row"),h2o.eventTypeDim=h2o.ndx.dimension(function(e){return e["Event Type"]}),h2o.eventTypeCount=h2o.eventTypeDim.group().reduceCount(),h2o.eventTypeChart=dc.rowChart("#chart-event-type-row"),h2o.table=dc.dataTable("#event-list");var header;h2o.data=[],h2o.dataDiv=d3.select("#data"),h2o.statusMsgDiv=d3.select("#status-msg"),h2o.statusMsgDiv.text("loading data..."),h2o.statusContainerDiv=d3.select("#status-container"),d3.selectAll("a#all").on("click",function(){dc.filterAll(),dc.renderAll()}),d3.selectAll("a#event-date").on("click",function(){h2o.dateChart.filterAll(),dc.redrawAll()}),d3.selectAll("a#region").on("click",function(){h2o.regionChart.filterAll(),dc.redrawAll()}),d3.selectAll("a#month").on("click",function(){h2o.monthChart.filterAll(),dc.redrawAll()}),d3.selectAll("a#event-type").on("click",function(){h2o.eventTypeChart.filterAll(),dc.redrawAll()}),h2o.init=function(){Tabletop.init({key:h2o.SHEET,callback:h2o.test})},h2o.test=function(e,o){h2o.statusMsgDiv.text("Spreadsheet loaded....processing..."),h2o.data=e,h2o.tabletop=o,h2o.overview_columns=e.Overview.columnNames,h2o.overview=[],h2o.old=[];var t=["Latitude","Longitude"];e.Overview.elements.forEach(function(e){t.forEach(function(o){e[o]=+e[o]}),e.Date=h2o.parseDate.parse(e.Date),""==e["Event Type"]&&(e["Event Type"]="Unknown"),e.Date>h2o.weekAgo?h2o.overview.push(e):h2o.old.push(e),e.Date>h2o.latest&&(h2o.latest=e.Date)}),h2o.ndx.add(h2o.overview),h2o.statusMsgDiv.text("Building charts..."),h2o.buildCharts()},h2o.buildCharts=function(){h2o.dateChart.width(h2o.DIMS.WIDE_WIDTH).height(h2o.DIMS.HEIGHT/2).dimension(h2o.dateDim).group(h2o.dateCount).x(d3.time.scale().domain([h2o.weekAgo,h2o.latest])).alwaysUseRounding(!0).gap(1).centerBar(!0).elasticY(!0),h2o.dateChart.yAxis().tickFormat(d3.format("d")),h2o.regionChart.width(h2o.DIMS.WIDTH).height(h2o.DIMS.HEIGHT).dimension(h2o.regionDim).group(h2o.regionCount).elasticX(!0),h2o.regionChart.xAxis().tickFormat(d3.format("d")),h2o.monthChart.width(h2o.DIMS.WIDTH).height(h2o.DIMS.HEIGHT).dimension(h2o.monthDim).group(h2o.monthCount).elasticX(!0),h2o.monthChart.xAxis().tickFormat(d3.format("d")),h2o.eventTypeChart.width(h2o.DIMS.WIDTH).height(h2o.DIMS.HEIGHT).dimension(h2o.eventTypeDim).group(h2o.eventTypeCount).elasticX(!0),h2o.eventTypeChart.xAxis().tickFormat(d3.format("d")),h2o.table.dimension(h2o.allDim).group(function(e){return"Event table"}).size(150).columns([{label:"Festival or Race",format:function(e){return'<a href="'+e["Festival or Race Page URL"]+'">'+e["Festival or Race"]+"</a>"}},{label:"Date",format:function(e){return e.Date.toDateString()}},"Region",{label:"Section",format:function(e){return""==e["River(s)"]?"<small>"+e["Section(s) (Grade)"]+"</small>":""!=e["Section(s) (Grade)"]?"<small>"+e["River(s)"]+" - "+e["Section(s) (Grade)"]+"</small>":"<small>"+e["River(s)"]+"</small>"}}]).sortBy(function(e){return e.Date}).order(d3.ascending),h2o.map=L.map("map").setView([39.74739,-90],3),h2o.mapbox=L.tileLayer("http://api.tiles.mapbox.com/v4/fenris.kdh92755/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZmVucmlzIiwiYSI6InRHbm4xbkEifQ.Q_qWH1M_NebCj3c6yiyXng",{attribution:"Map data &copy; [...]",maxZoom:18}).addTo(h2o.map),h2o.markers=new L.FeatureGroup,h2o.clusters=L.markerClusterGroup(),h2o.clusters.addLayer(h2o.markers).addTo(h2o.map),h2o.table.on("renderlet",function(e){e.select("tr.dc-table-group").remove(),h2o.markers.clearLayers(),h2o.clusters.clearLayers(),h2o.allDim.top(1/0).forEach(function(e){var o=e["Festival or Race"],t=e["Festival or Race Page URL"],a=L.marker([e.Latitude,e.Longitude]),n='<p><a href="'+t+'">'+o+"</a></p>";n+="<p>"+e.Date.toDateString()+"</p>",n+="<p>"+e["Event Type"]+"</p>",a.bindPopup(n),h2o.markers.addLayer(a)}),h2o.clusters.addLayer(h2o.markers)}),h2o.map.on("move",function(e){var o=L.latLngBounds(h2o.map.getBounds());h2o.allDim.filter(function(e){return o.contains([e.Latitude,e.Longitude])}),dc.redrawAll()}),dc.renderAll(),h2o.statusContainerDiv.style("display","none"),h2o.dataDiv.transition().style("opacity","1")},window.addEventListener("DOMContentLoaded",h2o.init);