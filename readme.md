Convert GEO-JSON data to SVG
============================

```javascript
import GEOJSONtoSVG from './geojson-to-svg';
const map = new GEOJSONtoSVG( document.getElementById( 'map' ), { north: 44.973158, south: 44.966818, west: -93.292704, east: -93.280053 }, { longitudeAdjustment: 0.7 } );
{
	let request = new XMLHttpRequest();
	request.open( 'GET', encodeURI( 'https://opendata.arcgis.com/datasets/8d110c659d614474839c9c0642d8974a_0.geojson' ) );
	request.onload = function() {
		if ( 200 === request.status ) {
			map.addLayer( 'trails', JSON.parse( request.responseText ) );
		}
	};
	request.send();
}
```
