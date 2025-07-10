// 全局變數
let map, dataLayer, userLocation;
let showOption = 'flooding';
let stats = { critical: 0, high: 0, medium: 0, total: 0 };

// 初始化地圖
function initMap() {
  // 創建地圖
  map = L.map('map', {
    center: [22.994906, 120.203460],
    zoom: 14,
    zoomControl: false
  });

  // 添加縮放控制到右下角
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map);

  // 添加圖層
  const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  });

  const nlscLayer = L.tileLayer('https://wmts.nlsc.gov.tw/wmts/PHOTO_MIX/default/EPSG:3857/{z}/{y}/{x}.png', {
    attribution: '<a href="https://maps.nlsc.gov.tw/" target="_blank">國土測繪圖資服務雲</a>',
    opacity: 0.8
  });

  // 預設使用 NLSC 圖層
  nlscLayer.addTo(map);

  // 圖層控制
  const baseLayers = {
    "衛星圖": nlscLayer,
    "街道圖": osmLayer
  };

  L.control.layers(baseLayers, null, {
    position: 'bottomright'
  }).addTo(map);

  // 載入淹水資料
  loadFloodData();
}

// 載入淹水資料
function loadFloodData() {
  fetch('https://kiang.github.io/fhy.wra.gov.tw/json/fhy.json')
    .then(response => response.json())
    .then(data => {
      createDataLayer(data);
      updateStats();
    })
    .catch(error => {
      console.error('載入資料失敗:', error);
      showNotification('載入資料失敗，請稍後再試', 'error');
    });
}

// 創建資料圖層
function createDataLayer(geojsonData) {
  // 移除舊的圖層
  if (dataLayer) {
    map.removeLayer(dataLayer);
  }

  // 創建新的圖層
  dataLayer = L.geoJSON(geojsonData, {
    pointToLayer: function(feature, latlng) {
      return createMarker(feature, latlng);
    },
    onEachFeature: function(feature, layer) {
      layer.on('click', function(e) {
        showPointInfo(feature, e);
      });
    },
    filter: function(feature) {
      return shouldShowPoint(feature);
    }
  }).addTo(map);
}

// 創建標記
function createMarker(feature, latlng) {
  const props = feature.properties;
  const value = parseInt(props.result);
  const unit = props.unitOfMeasurement;
  
  // 只顯示單位為 cm 的數據
  if (unit !== 'cm') {
    return null;
  }

  let color, size;
  
  if (value > 49) {
    color = '#0c0135';
    size = 14;
  } else if (value > 9) {
    color = '#f30050';
    size = 12;
  } else if (value > 0) {
    color = '#f3f350';
    size = 10;
  } else {
    color = '#00f350';
    size = 8;
  }

  return L.circleMarker(latlng, {
    radius: size,
    fillColor: color,
    color: 'white',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8
  });
}

// 判斷是否要顯示點位
function shouldShowPoint(feature) {
  const props = feature.properties;
  const value = parseInt(props.result);
  const unit = props.unitOfMeasurement;
  
  // 只顯示單位為 cm 的數據
  if (unit !== 'cm') {
    return false;
  }

  if (showOption === 'flooding') {
    return value > 0;
  } else {
    return true;
  }
}

// 顯示點位資訊
function showPointInfo(feature, event) {
  const props = feature.properties;
  const value = parseInt(props.result);
  const latlng = event.latlng;
  
  // 建立彈出視窗內容
  const timeUpdate = moment(props.phenomenonTime).tz('Asia/Taipei').format('YYYY-MM-DD HH:mm:ss');
  
  let valueClass = 'low';
  if (value > 49) valueClass = 'critical';
  else if (value > 9) valueClass = 'high';
  else if (value > 0) valueClass = 'medium';

  const popupContent = `
    <div class="popup-header">${props.stationName}</div>
    <div class="popup-info">更新時間：${timeUpdate}</div>
    <div class="popup-value ${valueClass}">${props.result} ${props.unitOfMeasurement}</div>
    <div class="popup-info">
      <strong>管理單位：</strong>${props.authority}<br>
      ${props.location ? `<strong>位置：</strong>${props.location}<br>` : ''}
      ${props.situation ? `<strong>狀況：</strong>${props.situation}<br>` : ''}
      ${props.dataSource ? `<strong>資料來源：</strong>${props.dataSource}<br>` : ''}
    </div>
    <div style="margin-top: 15px; display: flex; gap: 5px; flex-wrap: wrap;">
      <a href="https://www.google.com/maps/dir/?api=1&destination=${latlng.lat},${latlng.lng}&travelmode=driving" 
         target="_blank" class="nav-btn">
        <i class="fab fa-google"></i> Google
      </a>
      <a href="https://wego.here.com/directions/drive/mylocation/${latlng.lat},${latlng.lng}" 
         target="_blank" class="nav-btn">
        <i class="fas fa-route"></i> Here
      </a>
      <a href="https://bing.com/maps/default.aspx?rtp=~pos.${latlng.lat}_${latlng.lng}" 
         target="_blank" class="nav-btn">
        <i class="fab fa-microsoft"></i> Bing
      </a>
    </div>
  `;

  // 顯示彈出視窗
  L.popup()
    .setLatLng(latlng)
    .setContent(popupContent)
    .openOn(map);
}



// 更新統計資料
function updateStats() {
  stats = { critical: 0, high: 0, medium: 0, total: 0 };
  
  if (dataLayer) {
    dataLayer.eachLayer(function(layer) {
      if (layer.feature && layer.feature.properties) {
        const value = parseInt(layer.feature.properties.result);
        const unit = layer.feature.properties.unitOfMeasurement;
        
        if (unit === 'cm') {
          if (value > 49) {
            stats.critical++;
            stats.total++;
          } else if (value > 9) {
            stats.high++;
            stats.total++;
          } else if (value > 0) {
            stats.medium++;
            stats.total++;
          }
        }
      }
    });
  }

  // 更新顯示
  document.getElementById('stat-critical').textContent = stats.critical;
  document.getElementById('stat-high').textContent = stats.high;
  document.getElementById('stat-medium').textContent = stats.medium;
  document.getElementById('stat-total').textContent = stats.total;
}

// 獲取用戶位置
function getUserLocation() {
  if (navigator.geolocation) {
    const locationBtn = document.getElementById('location-btn');
    locationBtn.classList.add('active');
    
    navigator.geolocation.getCurrentPosition(
      function(position) {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // 移除舊的用戶位置標記
        if (userLocation) {
          map.removeLayer(userLocation);
        }
        
        // 添加用戶位置標記
        userLocation = L.marker([lat, lng], {
          icon: L.divIcon({
            className: 'user-location-icon',
            html: '<i class="fas fa-location-dot" style="color: #3399CC; font-size: 20px;"></i>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          })
        }).addTo(map);
        
        // 移動地圖到用戶位置
        map.setView([lat, lng], 15);
        
        locationBtn.classList.remove('active');
        showNotification('已定位到您的位置', 'success');
      },
      function(error) {
        locationBtn.classList.remove('active');
        showNotification('無法獲取位置資訊', 'error');
        console.error('Geolocation error:', error);
      }
    );
  } else {
    showNotification('瀏覽器不支援定位功能', 'error');
  }
}

// 顯示通知
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    z-index: 2000;
    animation: slideIn 0.3s ease-out;
  `;

  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// 事件監聽器
document.addEventListener('DOMContentLoaded', function() {
  // 初始化地圖
  initMap();

  // 位置按鈕
  document.getElementById('location-btn').addEventListener('click', getUserLocation);

  // 過濾按鈕
  document.getElementById('show-flooding').addEventListener('click', function() {
    showOption = 'flooding';
    updateFilterButtons();
    if (dataLayer) {
      map.removeLayer(dataLayer);
      loadFloodData();
    }
  });

  document.getElementById('show-all').addEventListener('click', function() {
    showOption = 'all';
    updateFilterButtons();
    if (dataLayer) {
      map.removeLayer(dataLayer);
      loadFloodData();
    }
  });

  // 更新過濾按鈕狀態
  function updateFilterButtons() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    if (showOption === 'flooding') {
      document.getElementById('show-flooding').classList.add('active');
    } else {
      document.getElementById('show-all').classList.add('active');
    }
  }
});

// 添加 CSS 動畫
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  .user-location-icon {
    background: none !important;
    border: none !important;
  }
`;
document.head.appendChild(style);