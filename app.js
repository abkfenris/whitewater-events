//var CLIENT_ID = '543058985761-1obk7elm4v961k6k40p6gai8q4f45vap.apps.googleusercontent.com';
// var SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

L.mapbox.accessToken = 'pk.eyJ1IjoiZmVucmlzIiwiYSI6InRHbm4xbkEifQ.Q_qWH1M_NebCj3c6yiyXng';

// set our global variables
var h2o = {};
h2o.CALLBACK_URL = 'https://spreadsheets.google.com/feeds/cells/1SgQvKoejjnWaQhcwTP39EDYUOmPCTK9Pc8li9cuOLu8/od6/public/values?alt=json-in-script&callback=myCallback';
h2o.SHEET = 'https://docs.google.com/spreadsheets/d/1SgQvKoejjnWaQhcwTP39EDYUOmPCTK9Pc8li9cuOLu8/edit?usp=sharing';
h2o.DIMS = {HEIGHT: 300, WIDTH: 350}


// cross filter, and all group/dimension
h2o.ndx = crossfilter();
h2o.all = h2o.ndx.groupAll()
h2o.allDim = h2o.ndx.dimension(function(d) {
  return d;
})

// count number of events selected
//h2o.filterCount = dc.dataCount('.filter-count');

// region charts
h2o.regionDim = h2o.ndx.dimension(function(d) {
  return d['Region'];
})
h2o.regionCount = h2o.regionDim.group().reduceCount();
h2o.regionChart = dc.rowChart('#chart-region-row');

// month charts
h2o.monthDim = h2o.ndx.dimension(function(d) {
  return d['Month'];
})
h2o.monthCount = h2o.monthDim.group().reduceCount();
h2o.monthChart = dc.rowChart('#chart-month-row');

// event type charts
h2o.eventTypeDim = h2o.ndx.dimension(function(d) {
  return d['Event Type'];
})
h2o.eventTypeCount = h2o.eventTypeDim.group().reduceCount();
h2o.eventTypeChart = dc.rowChart('#chart-event-type-row');

// event table
h2o.table = dc.dataTable('#event-list');



var header; // csv header
h2o.data = [], // all the data go here before it goes into crossfilter

    // a few divs that we use
    //authDiv = d3.select('#auth'),
h2o.dataDiv = d3.select('#data');
h2o.statusMsgDiv = d3.select('#status-msg');
h2o.statusMsgDiv
  .text('loading data...');
h2o.statusContainerDiv = d3.select('#status-container');

    // csv headers we are going to specifically process

    // cross filter, and all group/dimension


// reset buttons
d3.selectAll('a#all').on('click', function() {
  dc.filterAll();
  dc.renderAll();
});
d3.selectAll('a#region').on('click', function() {
  h2o.regionChart.filterAll();
  dc.redrawAll();
});
d3.selectAll('a#month').on('click', function() {
  h2o.monthChart.filterAll();
  dc.redrawAll();
});
d3.selectAll('a#event-type').on('click', function() {
  h2o.eventTypeChart.filterAll();
  dc.redrawAll();
});

h2o.init = function() {
  Tabletop.init( {
    key: h2o.SHEET,
    callback: h2o.test
  })
}

h2o.test = function(data, tabletop) {
  h2o.statusMsgDiv
    .text('Spreadsheet loaded....processing...');
  h2o.data = data;
  h2o.tabletop = tabletop;

  h2o.overview_columns = data.Overview.columnNames;

  h2o.overview = [];
  var numHeaders = ["Latitude", "Longitude"];
  data.Overview.elements.forEach(function(row) {
    numHeaders.forEach(function(numHeader) {
      row[numHeader] = +row[numHeader];
    });
    h2o.overview.push(row);
  })

  h2o.ndx.add(h2o.overview);
  h2o.statusMsgDiv
    .text('Building charts...');
  h2o.buildCharts();
}

h2o.buildCharts = function() {
  h2o.regionChart
    .width(h2o.DIMS.WIDTH)
    .height(h2o.DIMS.HEIGHT)
    .dimension(h2o.regionDim)
    .group(h2o.regionCount)
    .elasticX(true);
  
  h2o.monthChart
    .width(h2o.DIMS.WIDTH)
    .height(h2o.DIMS.HEIGHT)
    .dimension(h2o.monthDim)
    .group(h2o.monthCount)
    .elasticX(true);
  
  h2o.eventTypeChart
    .width(h2o.DIMS.WIDTH)
    .height(h2o.DIMS.HEIGHT)
    .dimension(h2o.eventTypeDim)
    .group(h2o.eventTypeCount)
    .elasticX(true);
  
  h2o.table
    .dimension(h2o.allDim)
    .group(function(d) { return 'Event table'; })
    .columns([
      "Festival or Race",
      "Date",
      "Region"
    ])
    .sortBy(function(d) { return d['Festival or Race']; })
    .order(d3.ascending)
    .on('renderlet', function(table) {
      // each time the table is rendered remove the extra row of the group name
      table.select('tr.dc-table-group').remove();
    });
  
  dc.renderAll();
  h2o.statusContainerDiv
    .style('display', 'none');
  h2o.dataDiv
    .transition()
    .style('opacity', '1');

  
}


window.addEventListener('DOMContentLoaded', h2o.init);