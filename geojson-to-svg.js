/**
 * Exports a class to handle the converison of GEO-JSON data to SVG.
 *
 * @summary A class to handle the conversion of GEO-JSON to SVG.
 *
 * @since 0.1.0
 *
 * @class GEOJSONtoSVG
 * @classdesc Handles the conversion of GEO-JSON data to SVG.
 */
export default class {

	/**
	 * @summary Constructor: Setup initial data and place the SVG element.
	 *
	 * Create the SVG element. Setup the organization for layer and GEOJSON data.
	 * Set the Latitide and Longitude boundries and calculate the conversion of those values to pixels.
	 *
	 * @since 0.1.0
	 *
	 * @class GEOJSONtoSVG
	 *
	 * @param {DOMNode} containerElement - The parent element for the generated SVG element.
	 * @param {object} boundriesObject - An object with four attributes: north, south, west, and east. Each attribute is a float latitude or longitude value.
	 * @param {object} attributes - Optional. Additional configuration attributes.
	 * @return {object} Returns the constructed class object.
	 */
	constructor( containerElement, boundriesObject, attributes ) {

		/**
		 * SVG namespace.
		 *
		 * @since 0.1.0
		 * @property {string} svgNS - The namespace value for SVG elements.
		 */
		this.svgNS = 'http://www.w3.org/2000/svg';

		/**
		 * The root SVG element.
		 *
		 * @since 0.1.0
		 * @property {DOMNode} svg - The SVG element.
		 */
		this.svg = document.createElementNS( this.svgNS, 'svg' );

		/**
		 * The data layers.
		 *
		 * @since 0.1.0
		 * @property {object} layers - An object containing the group elements constructed from GEOJSON data.
		 */
		this.layers = {};

		/**
		 * The data layer order.
		 *
		 * @since 0.1.0
		 * @property {array} layerOrder - An ordered array of the keys of the layers object.
		 */
		this.layerOrder = [];

		/**
		 * The GEOJSON data.
		 *
		 * @since 0.1.0
		 * @property {object} data - The GEOJSON data for each layer.
		 */
		this.data = {};

		/**
		 * The latitude and longitude boundries for the SVG image.
		 *
		 * @since 0.1.0
		 * @property {object} boundries - An object with four attributes: north, south, west, and east. Each attribute is a float latitude or longitude value.
		 */
//		this.boundries = ( boundriesObject && boundriesObject.north && boundriesObject.south && boundriesObject.west && boundriesObject.east ) ? boundriesObject : { north: 44.9707, south: 44.9698, west: -93.2897, east: -93.2882 };
this.boundries = ( boundriesObject && boundriesObject.north && boundriesObject.south && boundriesObject.west && boundriesObject.east ) ? boundriesObject : { north: 44.9216, south: 44.8974, west: -93.2897, east: -93.2459 };

		/**
		 * Additional configuration attributes.
		 *
		 * @since 0.1.0
		 * @property {object} attributes - Additional configuration attributes.
		 */
		this.attributes = attributes || {};

		/**
		 * The width in pixels of the containerElement.
		 *
		 * @since 0.1.0
		 * @property {integer} xAxisTotal - The width of the containerElement.
		 */
		this.xAxisTotal = parseInt( window.getComputedStyle( containerElement ).getPropertyValue( 'width' ) );

		/*longitudeAdjustment
		 * The latitude value of each pixel in the SVG image.
		 *
		 * @since 0.1.0
		 * @property {float} latitudePixelValue - The latitudePixelValue value of each pixel in the SVG image.
		 */
		this.latitudePixelValue = parseFloat( ( this.boundries.east - this.boundries.west ) / this.xAxisTotal );

		/**
		 * The longitude value of each pixel in the SVG image. Optionaly adjusted by the longitudeAdjustment value, which helps to approximate a map projection.
		 *
		 * @since 0.1.0
		 * @property {float} longitudePixelValue - The longitude value of each pixel in the SVG image.
		 */
		this.longitudePixelValue = parseFloat( this.latitudePixelValue * ( parseFloat( attributes.longitudeAdjustment ) || 1 ) );

		/**
		 * The height in pixels of the SVG image. As set by the longitude boundries.
		 *
		 * @since 0.1.0
		 * @property {integer} xAxisTotal - The height of the SVG image.
		 */
		this.yAxisTotal = parseFloat( ( this.boundries.north - this.boundries.south ) / this.longitudePixelValue );

		if ( ! containerElement ) {
			return this;
		}

		this.svg.setAttribute('height', Math.ceil( this.yAxisTotal ) + 'px');
		this.svg.setAttribute('width', '100%');

		containerElement.appendChild( this.svg );

		return this;
	}

	/**
	 * @summary Convert latitude longitude array to pixel values.
	 *
	 * Convert a two element array of latitude and longitude values to a two element array of x and y axis values in the SVG element.
	 *
	 * @since 0.1.0
	 *
	 * @class GEOJSONtoSVG
	 *
	 * @param {array} position - A two element array of latitude and longitude values.
	 * @return {array} - A two element array of x and y pixel values.
	 */
	coordinatePositionToSVGPosition( position ) {
		return [ ( position[0] - this.boundries.west ) / this.latitudePixelValue, this.yAxisTotal - ( position[1] - this.boundries.south ) / this.longitudePixelValue ];
	}

	/**
	 * @summary Checks if a x-y pixel point is within the bounds of the SVG image.
	 *
	 * Checks if a x-y pixel point is within the bounds of the SVG image and returns true or false.
	 *
	 * @since 0.1.0
	 *
	 * @class GEOJSONtoSVG
	 *
	 * @param {array} position - A two element array of x and y pixel values.
	 * @return {boolean} - The point passed to the function is within the bounds of the SVG image.
	 */
	isInBounds( pointsArray ) {
		return !!pointsArray.filter( ( point ) => {
			return ( point[0] >= 0 && point[0] <= this.xAxisTotal && point[1] >= 0 && point[1] <= this.yAxisTotal );
		} ).length;
	}

	/**
	 * @summary Passes GEOJSON data to generateGeometry based on the type attribute.
	 *
	 * Takes GEOJSON data and passes the data to the generateGeometry function based on the type attribute of the data.
	 *
	 * @since 0.1.0
	 *
	 * @class GEOJSONtoSVG
	 *
	 * @see generateGeometry
	 *
	 * @param {object} geojsonData - An object of GEOJSON data.
	 * @param {DOMNode} parentElement - The parent DOM Node.
	 * @return {null}
	 */
	handleDataByType( geojsonData, parentElement ) {
		if ( ! geojsonData || ! geojsonData.type ) {
			return;
		}

		if ( ! parentElement ) {
			parentElement = this.svg;
		}

		switch ( geojsonData.type ) {
			case 'Feature':
				if ( geojsonData.geometry ) {
					this.generateGeometry( geojsonData.geometry, parentElement, geojsonData.properties );
				}
				break;
			case 'FeatureCollection':
				if ( geojsonData.features && geojsonData.features.length ) {
					geojsonData.features.forEach( ( data ) => this.handleDataByType( data, parentElement ) );
				}
				break;
			case 'Point':
			case 'MultiPoint':
			case 'LineString':
			case 'MultiLineString':
			case 'Polygon':
			case 'MultiPolygon':
			case 'GeometryCollection':
				this.generateGeometry( geojsonData, parentElement );
				break;
		}
	}

	/**
	 * @summary Create an SVG node for a GEOJSON object.
	 *
	 * Take GEOJSON data and create an SVG node (Polygon, Path, or Circle).
	 *
	 * @since 0.1.0
	 *
	 * @class GEOJSONtoSVG
	 *
	 * @see coordinatePositionToSVGPosition
	 * @see isInBounds
	 *
	 * @param {object} geometry - An object of GEOJSON data.
	 * @param {DOMNode} parentElement - The parent DOM Node.
	 * @param {object} properties - Additional data properties from the GEOJSON data.
	 * @return {null}
	 */
	generateGeometry( geometry, parentElement, properties ) {
		if ( ! geometry || ! geometry.type || ! parentElement ) {
			return;
		}

		if ( ! properties ) {
			properties = {};
		}

		switch ( geometry.type ) {
			case 'Point':
				{
					let positionPoint = this.coordinatePositionToSVGPosition( geometry.coordinates );
					if ( this.isInBounds( [ positionPoint ] ) ) {
						let point = parentElement.appendChild( document.createElementNS( this.svgNS, 'circle' ) );
						point.setAttribute( 'cx', positionPoint[0] );
						point.setAttribute( 'cy', positionPoint[1] );
						point.setAttribute( 'r', 1 );
						if ( Object.keys( properties ).length ) {
							point.setAttribute( 'data-properties', JSON.stringify( properties ) );
						}
						for ( let key in properties ) {
							if ( properties[ key ] ) {
								point.classList.add( ( key + '--' + properties[ key ] ).replace( /\s+/g, '-' ) );
							}
						}
					}
				}
				break;
			case 'MultiPoint':
				{
					let group = parentElement.appendChild( document.createElementNS( this.svgNS, 'g' ) );
					if ( Object.keys( properties ).length ) {
						group.setAttribute( 'data-properties', JSON.stringify( properties ) );
					}
					for ( let key in properties ) {
						if ( properties[ key ] ) {
							group.classList.add( ( key + '--' + properties[ key ] ).replace( /\s+/g, '-' ) );
						}
					}
					geometry.coordinates.forEach( ( component ) => {
						this.generateGeometry( { type: 'Point', coordinates: component }, group );
					} );
				}
				break;
			case 'LineString':
				{
					let positionPoints = geometry.coordinates.map( ( coordinate ) => this.coordinatePositionToSVGPosition( coordinate ) );
					if ( this.isInBounds( positionPoints ) ) {
						let lineString = parentElement.appendChild( document.createElementNS( this.svgNS, 'path' ) );
						lineString.setAttribute( 'd', 'M' + positionPoints.join('L') );
						if ( Object.keys( properties ).length ) {
							lineString.setAttribute( 'data-properties', JSON.stringify( properties ) );
						}
						for ( let key in properties ) {
							if ( properties[ key ] ) {
								lineString.classList.add( ( key + '--' + properties[ key ] ).replace( /\s+/g, '-' ) );
							}
						}
					}
				}
				break;
			case 'MultiLineString':
				{
					let group = parentElement.appendChild( document.createElementNS( this.svgNS, 'g' ) );
					if ( Object.keys( properties ).length ) {
						group.setAttribute( 'data-properties', JSON.stringify( properties ) );
					}
					for ( let key in properties ) {
						if ( properties[ key ] ) {
							group.classList.add( ( key + '--' + properties[ key ] ).replace( /\s+/g, '-' ) );
						}
					}
					geometry.coordinates.forEach( ( component ) => {
						this.generateGeometry( { type: 'LineString', coordinates: component }, group );
					} );
				}
				break;
			case 'Polygon':
				{
					let positionPoints = geometry.coordinates.map( ( array ) => array.map( ( coordinate ) => this.coordinatePositionToSVGPosition( coordinate ) ) );
					if ( true || positionPoints.map( this.isInBounds ).reduce( function( accumulator, value ) { return accumulator || value; } ) ) {
						let polygon = parentElement.appendChild( document.createElementNS( this.svgNS, 'polygon' ) );
						polygon.setAttribute( 'points', positionPoints.join(' ') );
						if ( Object.keys( properties ).length ) {
							polygon.setAttribute( 'data-properties', JSON.stringify( properties ) );
						}
						for ( let key in properties ) {
							if ( properties[ key ] ) {
								polygon.classList.add( ( key + '--' + properties[ key ] ).replace( /\s+/g, '-' ) );
							}
						}
					}
				}
				break;
			case 'MultiPolygon':
				{
					let group = parentElement.appendChild( document.createElementNS( this.svgNS, 'g' ) );
					if ( Object.keys( properties ).length ) {
						group.setAttribute( 'data-properties', JSON.stringify( properties ) );
					}
					for ( let key in properties ) {
						if ( properties[ key ] ) {
							group.classList.add( ( key + '--' + properties[ key ] ).replace( /\s+/g, '-' ) );
						}
					}
					geometry.coordinates.forEach( ( component ) => {
						this.generateGeometry( { type: 'Polygon', coordinates: component }, group );
					} );
				}
				break;
			case 'GeometryCollection':
				{
					let group = parentElement.appendChild( document.createElementNS( this.svgNS, 'g' ) );
					if ( Object.keys( properties ).length ) {
						group.setAttribute( 'data-properties', JSON.stringify( properties ) );
					}
					for ( let key in properties ) {
						if ( properties[ key ] ) {
							group.classList.add( ( key + '--' + properties[ key ] ).replace( /\s+/g, '-' ) );
						}
					}
					geometry.geometries.forEach( ( geometry ) => {
						this.generateGeometry( geometry, group );
					} );
				}
				break;
		}
	}

	/**
	 * @summary Add a group element to the root SVG.
	 *
	 * Add a group element to the root SVG and populate that group element based on GEOJSON data.
	 *
	 * @since 0.1.0
	 *
	 * @class GEOJSONtoSVG
	 *
	 * @see handleDataByType
	 *
	 * @param {string} handle - An identifier for the passed data.
	 * @param {object} data - An object of GEOJSON data.
	 * @param {function} handler - Optional. A custom handler for the GEOJSON data.
	 * @return {object} Returns the class object.
	 */
	addLayer( handle, data, handler ) {
		this.data[ handle ] = data;
		this.layers[ handle ] = this.svg.appendChild( document.createElementNS( this.svgNS, 'g' ) );
		this.layers[ handle ].classList.add( handle );
		if ( handler && 'function' === typeof handler ) {
			handler( data,  this.layers[ handle ], this );
		} else {
			this.handleDataByType( data,  this.layers[ handle ] );
		}
		return this;
	}

	/**
	 * @summary Remove an existing group element.
	 *
	 * @since 0.1.0
	 *
	 * @class GEOJSONtoSVG
	 *
	 * @param {string} handle - An identifier for the group element.
	 * @return {object} Returns the class object.
	 */
	removeLayer( handle ) {
		if ( this.layers[ handle ] ) {
			this.layers[ handle ].parentNode.removeChild( this.layers[ handle ] );
			delete this.layers[ handle ];
			delete this.data[ handle ];
		}
		return this;
	}

	/**
	 * @summary Update an existing group element.
	 *
	 * Update a group element based on GEOJSON data. Create one if it does not exist.
	 *
	 * @since 0.1.0
	 *
	 * @class GEOJSONtoSVG
	 *
	 * @see addLayer
	 * @see handleDataByType
	 *
	 * @param {string} handle - An identifier for the passed data.
	 * @param {object} data - An object of GEOJSON data.
	 * @param {function} handler - Optional. A custom handler for the GEOJSON data.
	 * @return {object} Returns the class object.
	 */
	updateLayer( handle, data, handler ) {
		if ( this.layers[ handle ] ) {
			let fragment = document.createDocumentFragment();
			if ( handler && 'function' === typeof handler ) {
				handler( data,  fragment, this );
			} else {
				this.handleDataByType( data,  fragment );
			}
			this.layers[ handle ].innerHTML = '';
			this.layers[ handle ].appendChild( fragment );;
			this.data[ handle ] = data;
		} else {
			this.addLayer( handle, data, handler );
		}
		return this;
	}

	/**
	 * @summary Sort group elements.
	 *
	 * @since 0.1.0
	 *
	 * @class GEOJSONtoSVG
	 *
	 * @param {array} sortOrderArray - An array of group handles.
	 * @return {object} Returns the class object.
	 */
	sortLayers( sortOrderArray ) {
		if ( sortOrderArray && Array === sortOrderArray.constructor ) {
			this.layerOrder = sortOrderArray;
		}
		this.layerOrder.forEach( ( handle ) => {
			if ( this.layers[ handle ] ) {
				this.svg.appendChild( this.layers[ handle ] );
			}
		} );
		return this;
	}

}
