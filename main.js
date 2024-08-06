var sidebar = new ol.control.Sidebar({ element: 'sidebar', position: 'right' });

var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(20);
var matrixIds = new Array(20);
for (var z = 0; z < 20; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixIds[z] = z;
}
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

closer.onclick = function () {
  popup.setPosition(undefined);
  closer.blur();
  return false;
};

var popup = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250
  }
});

var nlscMatrixIds = new Array(21);
for (var i = 0; i < 21; ++i) {
  nlscMatrixIds[i] = i;
}

var pointDarkStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 10,
    fill: new ol.style.Fill({
      color: [12, 1, 53, 0.7]
    })
  })
});
var pointRedStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 10,
    fill: new ol.style.Fill({
      color: [243, 0, 80, 0.7]
    })
  })
});
var pointYellowStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 10,
    fill: new ol.style.Fill({
      color: [243, 243, 80, 0.7]
    })
  })
});
var pointGreenStyle = new ol.style.Style({
  image: new ol.style.Circle({
    radius: 10,
    fill: new ol.style.Fill({
      color: [0, 243, 80, 0.7]
    })
  })
});
var emptyStyle = new ol.style.Style({ image: '' });

var showOption = 'points';
var pointStyle = function (f) {
  var num = parseInt(f.get('result'));
  if (f.get('unitOfMeasurement') != 'cm') {
    return emptyStyle.clone();
  } else if (num > 49) {
    return pointDarkStyle.clone();
  } else if (num > 9) {
    return pointRedStyle.clone();
  } else if (num > 0) {
    return pointYellowStyle.clone();
  } else {
    if (showOption === 'all') {
      return pointGreenStyle.clone();
    } else {
      return null;
    }
  }
}

var vectorPoints = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'https://kiang.github.io/cit_water/docs/iot_water.json',
    format: new ol.format.GeoJSON()
  }),
  style: pointStyle
});
var vectorPointsFhy = new ol.layer.Vector({
  source: new ol.source.Vector({
    url: 'https://kiang.github.io/fhy.wra.gov.tw/json/fhy.json',
    format: new ol.format.GeoJSON()
  }),
  style: pointStyle
});

var baseLayer = new ol.layer.Tile({
  source: new ol.source.WMTS({
    matrixSet: 'EPSG:3857',
    format: 'image/png',
    url: 'https://wmts.nlsc.gov.tw/wmts',
    layer: 'PHOTO_MIX',
    tileGrid: new ol.tilegrid.WMTS({
      origin: ol.extent.getTopLeft(projectionExtent),
      resolutions: resolutions,
      matrixIds: matrixIds
    }),
    style: 'default',
    wrapX: true,
    attributions: '<a href="https://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>'
  }),
  opacity: 0.5
});


var appView = new ol.View({
  center: ol.proj.fromLonLat([120.20345985889435, 22.994906062625773]),
  zoom: 14
});

var map = new ol.Map({
  layers: [baseLayer, vectorPoints, vectorPointsFhy],
  overlays: [popup],
  target: 'map',
  view: appView
});

map.addControl(sidebar);

var geolocation = new ol.Geolocation({
  projection: appView.getProjection()
});

geolocation.setTracking(true);

geolocation.on('error', function (error) {
  console.log(error.message);
});

var positionFeature = new ol.Feature();

positionFeature.setStyle(new ol.style.Style({
  image: new ol.style.Circle({
    radius: 6,
    fill: new ol.style.Fill({
      color: '#3399CC'
    }),
    stroke: new ol.style.Stroke({
      color: '#fff',
      width: 2
    })
  })
}));

var geolocationCentered = false;
geolocation.on('change:position', function () {
  var coordinates = geolocation.getPosition();
  if (coordinates) {
    positionFeature.setGeometry(new ol.geom.Point(coordinates));
    if (false === geolocationCentered) {
      map.getView().setCenter(coordinates);
      geolocationCentered = true;
    }
  }
});

new ol.layer.Vector({
  map: map,
  source: new ol.source.Vector({
    features: [positionFeature]
  })
});

map.on('singleclick', function (evt) {
  var sideBarOpened = false;
  $('#sidebar-main-block').html('');
  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    var p = feature.getProperties();
    var lonLat = ol.proj.toLonLat(p.geometry.getCoordinates());
    var message = '';
    if (p.stationName) {
      let timeUpdate = moment(p.phenomenonTime).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
      message += '<h2>' + p.stationName + '</h2>';
      message += '<table class="table table-dark table-bordered">';
      message += '<tr><td>更新時間</td><td>' + timeUpdate + '</td></tr>';
      message += '<tr><td>管理單位</td><td>' + p.authority + '</td></tr>';
      message += '<tr><td>量測數值</td><td>' + p.result + ' ' + p.unitOfMeasurement + '</td></tr>';
      message += '<tr><td colspan="2">';
      message += '<div class="btn-group-vertical" role="group" style="width: 100%;">';
      message += '<a href="https://www.google.com/maps/dir/?api=1&destination=' + lonLat[1] + ',' + lonLat[0] + '&travelmode=driving" target="_blank" class="btn btn-info btn-lg btn-block">Google 導航</a>';
      message += '<a href="https://wego.here.com/directions/drive/mylocation/' + lonLat[1] + ',' + lonLat[0] + '" target="_blank" class="btn btn-info btn-lg btn-block">Here WeGo 導航</a>';
      message += '<a href="https://bing.com/maps/default.aspx?rtp=~pos.' + lonLat[1] + '_' + lonLat[0] + '" target="_blank" class="btn btn-info btn-lg btn-block">Bing 導航</a>';
      message += '</div></td></tr>';
      message += '</table>';
    }
    $('#sidebar-main-block').append(message);
    sidebar.open('home');
  });
});

$('#showPoints').click(function (e) {
  e.preventDefault();
  showOption = 'points';
  vectorPoints.getSource().refresh();

  $('a.btn-show').removeClass('btn-primary').addClass('btn-secondary');
  $(this).removeClass('btn-secondary').addClass('btn-primary');
});

$('#showAll').click(function (e) {
  e.preventDefault();
  showOption = 'all';
  vectorPoints.getSource().refresh();

  $('a.btn-show').removeClass('btn-primary').addClass('btn-secondary');
  $(this).removeClass('btn-secondary').addClass('btn-primary');
});

$('#countPoints').click(function (e) {
  e.preventDefault();
  var counter = {
    dark: 0,
    red: 0,
    yellow: 0,
    all: 0
  };
  vectorPoints.getSource().forEachFeature(function (f) {
    var num = parseInt(f.get('result'));
    if (num > 49) {
      counter.dark++;
      counter.all++;
    } else if (num > 9) {
      counter.red++;
      counter.all++;
    } else if (num > 0) {
      counter.yellow++;
      counter.all++;
    }
  });
  var message = '<table class="table table-dark">';
  message += '<tbody>';
  message += '<tr><th scope="row">深藍(>49cm)</th><td>' + counter.dark + '</td></tr>';
  message += '<tr><th scope="row">紅(>9cm)</th><td>' + counter.red + '</td></tr>';
  message += '<tr><th scope="row">黃(>0cm)</th><td>' + counter.yellow + '</td></tr>';
  message += '<tr><th scope="row">合計</th><td>' + counter.all + '</td></tr>';
  message += '</tbody></table>';
  $('#countBlock').html(message);
});
