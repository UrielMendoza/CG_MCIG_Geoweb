$(document).ready(function(){
	var map = L.map('map').setView([19.29075, -99.22141], 5); // ajustar coordenadas y nivel de zoom

	var osmLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap<\/a> contributors'
	}).addTo(map);
	
	function popUpInfo(features, layer) {
		if(features.properties && features.properties.nombre) {
			layer.bindPopup("<b>"+features.properties.nombre+"</b><br/>"+features.properties.delmun+"</b><br/>"+features.properties.tamanio);
		}
	}
	
	var miconsulta = L.geoJson(null, {
		pointToLayer: function(features, latlng) {
			var tipo = features.properties.tipo;
			switch (tipo) {
				case 'INSTITUCIONES DE LA ADMINISTRACION PUBLICA':
					return L.circleMarker(latlng, { color: "#ff0000", weight: 25 });
				case 'CENTROS DE INVESTIGACION':
					return L.circleMarker(latlng, { color: "#fc8505", weight: 20 });
				case 'PERSONA FISICA':
					return L.circleMarker(latlng, { color: "#4b6f9c", weight: 10 });
				case 'INSTITUCIONES DE ENSEÑANZA SUPERIOR':
					return L.circleMarker(latlng, { color: "#767578", weight: 5 });
				case 'INSTITUCIONES PRIVADAS NO LUCRATIVAS':
					return L.circleMarker(latlng, { color: "#118a11", weight: 15 });
				default:
					return L.circleMarker(latlng, { color: "#000000", weight: 3 });
			}
		},
		onEachFeature: popUpInfo
	}).addTo(map);

	$('#envio_post').submit(function(event) {
		event.preventDefault(); // Prevenir el envío del formulario

		// Se obtienen los valores de los campos del formulario
		var instituciones = $('#instituciones').val();
		var centros = $('#centros').val();
		// Valor de radio button
		var distancia = $('input:radio[name=distancia]:checked').val();
		// Valor de select
		var instituciones_km = $('#instituciones_km').val();
		// Valor de checkbox
		var calcular_linea = $('#calcular_linea').is(':checked');

		var dataString = 'instituciones=' + instituciones + '&centros=' + centros + '&distancia=' + distancia + '&instituciones_km=' + instituciones_km + '&calcular_linea=' + calcular_linea;

		var URL = 'php/listaInst_post.php';
		var ajax_post = $.ajax({
			type: "POST",
			url: URL,
			dataType: 'json',
			timeout: 10000,
			cache: false,
			data: dataString,
			beforeSend: function() { 
				alert("Esperando respuesta desde servidor ubuntu");
			},
			success: function(response) {
				miconsulta.clearLayers();
				$('#contenido').html('');
				var contenido_html = "";

				// Procesar instituciones
				if (response.instituciones && response.instituciones.features && response.instituciones.features.length > 0) {
					contenido_html += "<h3>Instituciones</h3>";
					var institucionesLayer = L.geoJson(response.instituciones, {
						pointToLayer: function(features, latlng) {
							return L.circleMarker(latlng, { color: "#00FFE0", weight: 5 });
						},
						onEachFeature: function(features, layer) {
							popUpInfo(features, layer);
							var properties = features.properties;
							contenido_html += "Nombre: " + properties.nombre + "<br/>";
							contenido_html += "Tipo: " + properties.tipo + "<br/>";
							contenido_html += "Municipio: " + properties.delmun + "<br/>";
							contenido_html += "Entidad: " + properties.entidad + "<br/>";
							contenido_html += "Sector: " + properties.sector + "<br/>";
							contenido_html += "Rama: " + properties.rama + "<br/>";
							contenido_html += "Clase: " + properties.clase + "<br/>";
							contenido_html += "Tamaño: " + properties.tamanio + "<br/>";
							contenido_html += "<hr/>";
						}
					});
					institucionesLayer.addTo(map);
					miconsulta.addLayer(institucionesLayer);
				}
				
				// Procesar centros
				if (response.centros && response.centros.features && response.centros.features.length > 0) {
					contenido_html += "<h3>Centros</h3>";
					var centrosLayer = L.geoJson(response.centros, {
						pointToLayer: function(features, latlng) {
							return L.circleMarker(latlng, { color: "#fc8505", weight: 5 });
						},
						onEachFeature: function(features, layer) {
							popUpInfo(features, layer);
							var properties = features.properties;
							contenido_html += "Nombre: " + properties.nombre + "<br/>";
							contenido_html += "Tipo: " + properties.tipo + "<br/>";
							contenido_html += "Municipio: " + properties.delmun + "<br/>";
							contenido_html += "Entidad: " + properties.entidad + "<br/>";
							contenido_html += "Sector: " + properties.sector + "<br/>";
							contenido_html += "Rama: " + properties.rama + "<br/>";
							contenido_html += "Clase: " + properties.clase + "<br/>";
							contenido_html += "Tamaño: " + properties.tamanio + "<br/>";
							contenido_html += "<hr/>";
						}
					});
					centrosLayer.addTo(map);
					miconsulta.addLayer(centrosLayer);
				}
				
				// Procesar instituciones_km
				if (response.instituciones_km && response.instituciones_km.features && response.instituciones_km.features.length > 0) {
					contenido_html += "<h3>Instituciones dentro de " + instituciones_km + " km</h3>";
					var institucionesKmLayer = L.geoJson(response.instituciones_km, {
						pointToLayer: function(features, latlng) {
							return L.circleMarker(latlng, { color: "#0094FF", weight: 5 });
						},
						onEachFeature: function(features, layer) {
							popUpInfo(features, layer);
							var properties = features.properties;
							contenido_html += "Nombre: " + properties.nombre + "<br/>";
							contenido_html += "Tipo: " + properties.tipo + "<br/>";
							contenido_html += "Municipio: " + properties.delmun + "<br/>";
							contenido_html += "Entidad: " + properties.entidad + "<br/>";
							contenido_html += "Sector: " + properties.sector + "<br/>";
							contenido_html += "Rama: " + properties.rama + "<br/>";
							contenido_html += "Clase: " + properties.clase + "<br/>";
							contenido_html += "Tamaño: " + properties.tamanio + "<br/>";
							contenido_html += "<hr/>";
						}
					});
					institucionesKmLayer.addTo(map);
					miconsulta.addLayer(institucionesKmLayer);
				}
				
				// Procesar distancia
				if (response.distancia && response.distancia.distancia_km) {
					var distanciaKm = response.distancia.distancia_km;
					var distanciaTexto = "Distancia desde el domicilio de " + distancia + " hasta CentroGeo: " + distanciaKm + " km";
					contenido_html += "<h3>Distancia</h3><p>" + distanciaTexto + "</p><hr/>";
				}
				
				// Procesar línea
				if (response.linea && response.linea.type === "LineString") {
					var lineaLayer = L.geoJson(response.linea, {
						style: {
							color: '#FF0000',
							weight: 3
						}
					});
					lineaLayer.addTo(map);
					miconsulta.addLayer(lineaLayer);
					contenido_html += "<h3>Línea</h3><p>Línea añadida al mapa</p><hr/>";
				}

				$('#contenido').append(contenido_html);
			},
			error: function(jqXHR, estado, error) {
				$('#contenido').html('Se produjo un error:' + estado + ' error: ' + error);
			},
			complete: function(jqXHR, estado) {
				alert("Se ha completado la solicitud al WS con el estado: " + estado);
			}
		}); //fin del componente Ajax
		miconsulta.addTo(map);
		// previene el re-envío del requerimiento
		return false;
	}); //fin del evento submit
}); //fin de document.ready function
