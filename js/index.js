// change for heavy hitting
//var FILENAME = '/test.csv';
var FILENAME = '/full.csv';

// globals that we don't want to loose into a closure
var logs,
    ndx, // our crossfilter
    // dimensions
    dayOfWeekDim,
    appCatDim,
    appDim,
    rcvdbyteDim,
    timeDim,
    // groups
    all,
    countPerDay,
    countPerAppCat,
    countPerApp,
    countPerTime,
    groupBytesDay,
    groupBytesByAppCat,
    // charts
    dataCount = dc.dataCount('#data-count'),
    dayChart = dc.pieChart('#chart-ring-day'),
    appCatChart = dc.pieChart('#chart-ring-app-cat'),
    appChart = dc.rowChart('#chart-row-app'),
    bytesDayChart = dc.pieChart('#chart-ring-bytes-day'),
    timeChart = dc.lineChart('#chart-line-time'),
    bytesAppCatChart = dc.pieChart('#chart-ring-bytes-app-cat');

// lets load some data
d3.csv(FILENAME, function(data) {
    logs = data;

    // formats that we are interested in
    var dateTime = d3.time.format('%Y-%m-%dT%H:%M:%S');
    var time = d3.time.format('%H:%M:%S');
    var dayOfWeekFormat = d3.time.format('%A');
    
    // munge datatypes into saner things
    logs.forEach(function(d) {
        // something = +something coerces strings to numbers
        // simple strings to numbers
        d.appid = +d.appid;
        d.dstport = +d.dstport;
        d.duration = +d.duration;
        d.rcvdbyte = +d.rcvdbyte;
        d.rcvdpkt = +d.rcvdbyte;
        d.sentbyte = +d.sentbyte;
        d.sentpkt = +d.sentpkt;
        d.sessionid = +d.sessionid;
        d.srcport = +d.srcport;

        // make a native datetime object
        d.dt = dateTime.parse(d.datetime);
        d.t = time.parse(d.time);
        // get the day of the week from the dt object
        d.day_of_week = dayOfWeekFormat(d.dt);
    });
    console.log(logs[0]);

    // lets make our crossfilter
    ndx = crossfilter(logs);

    // our dimensions
    dayOfWeekDim = ndx.dimension(function(d) {
        return d.day_of_week;
    });
    appCatDim = ndx.dimension(function(d) {
        return d.appcat;
    });
    appDim = ndx.dimension(function(d) {
        return d.app;
    });
    rcvdbyteDim = ndx.dimension(function(d) {
        return d.rcvdbyte;
    });
    timeDim = ndx.dimension(function(d) {
        return d3.time.minute(d.t);
    });

    // our groups
    all = ndx.groupAll();
    countPerDay = dayOfWeekDim.group().reduceCount();
    countPerAppCat = appCatDim.group().reduceCount();
    countPerApp = appDim.group().reduceCount();
    //countPerApp = appDim.group().reduceSum(function(d) {
    //    return d.rcvdbyte / 1000000;
    //});
    //countPerTime = timeDim.group().reduceCount();
    countPerTime = timeDim.group().reduceSum(function(d) {
        return d.rcvdbyte / 1000000; // bytes to megabytes
    });
    groupBytesDay = dayOfWeekDim.group().reduceSum(function(d) {
        return d.rcvdbyte / 1000000;
    });
    groupBytesByAppCat = appCatDim.group().reduceSum(function(d) {
        return d.rcvdbyte / 1000000;
    });

    // show how many records are selected
    dataCount
        .dimension(ndx)
        .group(all);

    // show the days of the week
    dayChart
        .width(200)
        .height(200)
        .dimension(dayOfWeekDim)
        .group(countPerDay)
        .innerRadius(20)
        .ordering(function(d) {
            var order = {
                'Sunday': 0,
                'Monday': 1,
                'Tuesday': 2,
                'Wednesday': 3,
                'Thursday': 4,
                'Friday': 5,
                'Saturday': 6
            };
            return order[d.key];
        });

        appCatChart
            .width(200)
            .height(200)
            .dimension(appCatDim)
            .group(countPerAppCat)
            .innerRadius(20);
        
        bytesDayChart
            .width(200)
            .height(200)
            .dimension(dayOfWeekDim)
            .group(groupBytesDay)
            .innerRadius(20)
            .ordering(function(d) {
                var order = {
                    'Sunday': 0,
                    'Monday': 1,
                    'Tuesday': 2,
                    'Wednesday': 3,
                    'Thursday': 4,
                    'Friday': 5,
                    'Saturday': 6
                };
                return order[d.key];
            });

        bytesAppCatChart
            .width(200)
            .height(200)
            .dimension(appCatDim)
            .group(groupBytesByAppCat)
            .innerRadius(20)
            .ordering(function(d) {
                var order = {
                    'Sunday': 0,
                    'Monday': 1,
                    'Tuesday': 2,
                    'Wednesday': 3,
                    'Thursday': 4,
                    'Friday': 5,
                    'Saturday': 6
                };
                return order[d.key];
            });
        
        appChart
            .width(300)
            .height(1600)
            .margins({top: 10, left: 20, right: 20, bottom: 20})
            .dimension(appDim)
            .group(countPerApp)
            .elasticX(true);
        
        timeChart
            .width(720)
            .height(200)
            .margins({top: 10, left: 50, right: 20, bottom: 20})
            .renderArea(true)
            .dimension(timeDim)
            .group(countPerTime)
            .elasticY(true)
                .x(d3.time.scale().domain(d3.extent(logs, function(d) {
                    return d.t;
                })))
                .y(d3.scale)
                ;


    dc.renderAll();
});

// reseters
d3.selectAll('a#all').on('click', function() {
    dc.filterAll();
    dc.renderAll();
});
d3.selectAll('a#time').on('click', function() {
    timeChart.filterAll();
    dc.redrawAll();
});
d3.selectAll('a#day').on('click', function() {
    dayChart.filterAll();
    dc.redrawAll();
});
d3.selectAll('a#app-cat').on('click', function() {
    appCatChart.filterAll();
    dc.redrawAll();
});
d3.selectAll('a#bytes-day').on('click', function() {
    bytesDayChart.filterAll();
    dc.redrawAll();
});
d3.selectAll('a#bytes-app-cat').on('click', function() {
    bytesAppCatChart.filterAll();
    dc.redrawAll();
});
d3.selectAll('a#app').on('click', function() {
    appChart.filterAll();
    dc.redrawAll();
});