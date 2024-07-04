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

		// Validar campos
		var clase = $('#clase').val();
		var tamanio = $('#tamanio option:selected').val();

		var dataString = 'clase=' + clase + '&tamanio=' + tamanio;

		if (!clase || !tamanio) {
			alert("Por favor, complete todos los campos antes de enviar.");
			return false;
		}

		var URL = 'php/listaInst_post.php';
		var contenido_html = "";
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
				if (response.features && response.features.length > 0) {
					miconsulta.addData(response);
					for (var i = 0; i < response.features.length; i++) {
						var feature = response.features[i];
						var properties = feature.properties;
						contenido_html += "Nombre: " + properties.nombre + "<br/>";
						contenido_html += "Tipo: " + properties.tipo + "<br/>";
						contenido_html += "Municipio: " + properties.delmun + "<br/>";
						contenido_html += "Entidad: " + properties.entidad + "<br/>";
						contenido_html += "Sector: " + properties.sector + "<br/>";
						contenido_html += "Rama: " + properties.rama + "<br/>";
						contenido_html += "Clase: " + properties.clase + "<br/>";
						contenido_html += "Tamaño: " + properties.tamanio + "<br/>";
						contenido_html += "<hr/>";
						$('#contenido').append(contenido_html);
					}
				} else {
					contenido_html = "La consulta no tiene resultados" + "<br/>";
					$('#contenido').append(contenido_html);
				}
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
