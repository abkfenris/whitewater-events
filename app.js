//var CLIENT_ID = '543058985761-1obk7elm4v961k6k40p6gai8q4f45vap.apps.googleusercontent.com';
// var SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

L.mapbox.accessToken = 'pk.eyJ1IjoiZmVucmlzIiwiYSI6InRHbm4xbkEifQ.Q_qWH1M_NebCj3c6yiyXng';

// set our global variables
var h2o = {};
h2o.CALLBACK_URL = 'https://spreadsheets.google.com/feeds/cells/1SgQvKoejjnWaQhcwTP39EDYUOmPCTK9Pc8li9cuOLu8/od6/public/values?alt=json-in-script&callback=myCallback';
h2o.SHEET = 'https://docs.google.com/spreadsheets/d/1SgQvKoejjnWaQhcwTP39EDYUOmPCTK9Pc8li9cuOLu8/edit?usp=sharing';
h2o.DIMS = {HEIGHT: 300, WIDTH: 300}
h2o.MapDim = d3.select('#map');
h2o.DIMS.WIDE_WIDTH = h2o.MapDim.node().getBoundingClientRect().width;

h2o.parseDate = d3.time.format('%m/%d/%Y');
h2o.weekOffset = -7 * 24 * 60 * 60 * 1000 // days, hours, min, seconds, milliseconds offset
h2o.weekAgo = new Date(new Date().getTime() + h2o.weekOffset)
h2o.latest = h2o.weekAgo;


// cross filter, and all group/dimension
h2o.ndx = crossfilter();
h2o.all = h2o.ndx.groupAll()
h2o.allDim = h2o.ndx.dimension(function(d) {
  return d;
})

// count number of events selected
//h2o.filterCount = dc.dataCount('.filter-count');
h2o.dateDim = h2o.ndx.dimension(function(d) {
  return d['Date'];
})
h2o.dateCount = h2o.dateDim.group().reduceCount();
h2o.dateChart = dc.barChart('#chart-event-date');

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
d3.selectAll('a#event-date').on('click', function() {
  h2o.dateChart.filterAll();
  dc.redrawAll();
})
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
  h2o.old = [];
  var numHeaders = ["Latitude", "Longitude"];
  data.Overview.elements.forEach(function(row) {
    numHeaders.forEach(function(numHeader) {
      row[numHeader] = +row[numHeader];
    });

    row.Date = h2o.parseDate.parse(row.Date);

    if (row['Event Type'] == '') {
      row['Event Type'] = 'Unknown'
    }

    if (row.Date > h2o.weekAgo) {
      h2o.overview.push(row);
    } else {
      h2o.old.push(row);
    }
    if (row.Date > h2o.latest) {
      h2o.latest = row.Date;
    }
  })

  h2o.ndx.add(h2o.overview);
  h2o.statusMsgDiv
    .text('Building charts...');
  h2o.buildCharts();
}

h2o.buildCharts = function() {
  h2o.dateChart
    .width(h2o.DIMS.WIDE_WIDTH)
    .height(h2o.DIMS.HEIGHT / 2)
    .dimension(h2o.dateDim)
    .group(h2o.dateCount)
    .x(d3.time.scale().domain([h2o.weekAgo, h2o.latest]))
    //.round(d3.time.week.round)
    .alwaysUseRounding(true)
    //.xUnits(d3.time.weeks)
    .gap(1)
    .centerBar(true)
    .elasticY(true)
    ;
  h2o.dateChart.yAxis()
    .tickFormat(d3.format('d'));

  h2o.regionChart
    .width(h2o.DIMS.WIDTH)
    .height(h2o.DIMS.HEIGHT)
    .dimension(h2o.regionDim)
    .group(h2o.regionCount)
    .elasticX(true);
  h2o.regionChart.xAxis()
    .tickFormat(d3.format('d'));
  
  h2o.monthChart
    .width(h2o.DIMS.WIDTH)
    .height(h2o.DIMS.HEIGHT)
    .dimension(h2o.monthDim)
    .group(h2o.monthCount)
    .elasticX(true);
  h2o.monthChart.xAxis()
    .tickFormat(d3.format('d'));
  
  h2o.eventTypeChart
    .width(h2o.DIMS.WIDTH)
    .height(h2o.DIMS.HEIGHT)
    .dimension(h2o.eventTypeDim)
    .group(h2o.eventTypeCount)
    .elasticX(true);
  h2o.eventTypeChart.xAxis()
    .tickFormat(d3.format('d'));
  
  h2o.table
    .dimension(h2o.allDim)
    .group(function(d) { return 'Event table'; })
    .size(150)
    .columns([
      {
        label: "Festival or Race",
        format: function(d) {
          return '<a href="'+ d["Festival or Race Page URL"] + '">' + d["Festival or Race"] + '</a>';
        }
      },
      {
        label: "Date",
        format: function(d) {
          return d.Date.toDateString();
        }
      },
      "Region",
      {
        label: 'Section',
        format: function(d) {
          if (d["River(s)"] == "") {
            return '<small>' + d["Section(s) (Grade)"] + '</small>';
          } else if (d["Section(s) (Grade)"] != "") {
            return '<small>' + d["River(s)"] + ' - ' + d["Section(s) (Grade)"] + '</small>';
          } else {
            return '<small>' + d["River(s)"] +  '</small>';
          }
        }
      }
    ])
    .sortBy(function(d) { return d['Date']; })
    .order(d3.ascending);
    /*.on('renderlet', function(table) {
      // each time the table is rendered remove the extra row of the group name
      
    });*/
  
  h2o.map = L.map('map').setView([39.74739, -90], 3);
  h2o.mapbox = L.tileLayer('http://api.tiles.mapbox.com/v4/fenris.kdh92755/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZmVucmlzIiwiYSI6InRHbm4xbkEifQ.Q_qWH1M_NebCj3c6yiyXng', {
      attribution: 'Map data &copy; [...]',
      maxZoom: 18
    }).addTo(h2o.map);
  
  h2o.markers = new L.FeatureGroup();
  h2o.clusters = L.markerClusterGroup();
  h2o.clusters.addLayer(h2o.markers)
              .addTo(h2o.map);
  
  h2o.table.on('renderlet', function(table) {
    table.select('tr.dc-table-group').remove();

    h2o.markers.clearLayers();
    h2o.clusters.clearLayers();
    h2o.allDim.top(Infinity).forEach(function(d) {
      var name = d['Festival or Race'];
      var url = d['Festival or Race Page URL'];
      var marker = L.marker([d['Latitude'], d['Longitude']]);
      var popUpDiv = '<p><a href="' + url + '">' + name + '</a></p>';
      popUpDiv += '<p>' + d['Date'].toDateString() + '</p>';
      popUpDiv += '<p>' + d['Event Type'] + '</p>';
      marker.bindPopup(popUpDiv);
      h2o.markers.addLayer(marker);
    })
    h2o.clusters.addLayer(h2o.markers);
  })

  h2o.map.on('move', function(event) {
    var bounds = L.latLngBounds(h2o.map.getBounds());
    h2o.allDim.filter(function(d) {
      return bounds.contains([d['Latitude'], d['Longitude']]);
    })
    dc.redrawAll();
  })
  
  dc.renderAll();
  h2o.statusContainerDiv
    .style('display', 'none');
  h2o.dataDiv
    .transition()
    .style('opacity', '1');

  
}


window.addEventListener('DOMContentLoaded', h2o.init);