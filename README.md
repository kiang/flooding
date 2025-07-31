# 臺灣淹水地圖 Taiwan Flooding Map

A real-time interactive map visualization of flooding conditions across Taiwan, built with modern web technologies.

## Features

- **Real-time Data**: Live flooding data from Taiwan's Water Resources Agency (防災資訊服務網)
- **Interactive Map**: Modern Leaflet-based map interface with intuitive navigation
- **Severity Levels**: Color-coded markers indicating different flooding severity levels
- **Collapsible Legend**: Integrated legend and statistics panel with filtering options
- **Responsive Design**: Mobile-optimized interface that works on all devices
- **Location Services**: Built-in geolocation to find user's current position
- **Navigation Integration**: Direct links to Google Maps, Here WeGo, and Bing Maps

## Flooding Severity Levels

- 🔵 **嚴重淹水** (Critical): Water level > 49cm
- 🔴 **高度淹水** (High): Water level 10-49cm  
- 🟡 **輕微淹水** (Medium): Water level 1-9cm
- 🟢 **無淹水** (Normal): Water level 0cm

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Mapping**: Leaflet.js v1.9.4
- **Styling**: Custom CSS with modern design principles
- **Icons**: Font Awesome 6.4.0
- **Fonts**: Noto Sans TC (Google Fonts)
- **Date/Time**: Moment.js with timezone support
- **Base Maps**: 
  - National Land Surveying and Mapping Center (NLSC) satellite imagery
  - OpenStreetMap tiles

## Data Sources

- **Flooding Data**: [FHY Water Resources Agency](https://kiang.github.io/fhy.wra.gov.tw/json/fhy.json)
- **Base Maps**: [National Land Surveying and Mapping Center](https://maps.nlsc.gov.tw/)

## Features Overview

### Interactive Controls
- **Location Button**: Find and center map on user's current location
- **Filter Toggle**: Switch between showing only flooding points or all monitoring stations
- **Collapsible Panel**: Expandable legend with real-time statistics

### Modern UI/UX
- Glass-morphism design with backdrop blur effects
- Smooth animations and hover effects
- Responsive floating panels
- Touch-friendly mobile interface
- High contrast buttons for accessibility

### Real-time Statistics
Live counting of flooding incidents by severity level:
- Critical flooding incidents
- High-level flooding incidents  
- Minor flooding incidents
- Total monitoring stations

## Installation

1. Clone the repository:
```bash
git clone https://github.com/kiang/flooding.git
cd flooding
```

2. Serve the files using any web server:
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

3. Open your browser and navigate to `http://localhost:8000`

## Development

The project uses vanilla JavaScript and modern CSS features. No build process is required.

### File Structure
```
flooding/
├── index.html          # Main HTML file
├── main.js            # Core JavaScript functionality
├── css/               # Stylesheets (if any additional CSS files)
├── js/                # Additional JavaScript files (if any)
├── README.md          # This file
└── LICENSE            # MIT License
```

### Key Components

- **Map Initialization**: Leaflet map setup with multiple tile layers
- **Data Loading**: Fetch and process GeoJSON flooding data
- **Marker Creation**: Dynamic marker generation based on water levels
- **UI Controls**: Interactive panels and filtering functionality
- **Responsive Design**: Mobile-first CSS with media queries

## Browser Support

- Chrome/Chromium 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request

## Changelog

### Recent Updates
- **v3.0**: Complete redesign with modern Leaflet-based interface
- **v2.1**: Consolidate interface and create unified legend panel
- **v2.0**: Remove unused IoT water data source and enhance FHY data display
- **v1.x**: Original OpenLayers implementation

## Acknowledgments

- Taiwan Water Resources Agency for providing real-time flooding data
- National Land Surveying and Mapping Center for base map tiles
- OpenStreetMap contributors for alternative map tiles
- Font Awesome for iconography
- Google Fonts for typography

## Contact

For questions, suggestions, or issues, please contact:
- **Email**: [Contact via GitHub Issues](https://github.com/kiang/flooding/issues)
- **Facebook**: [江明宗](https://www.facebook.com/k.olc.tw/)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ for Taiwan's disaster preparedness and public safety**