document.addEventListener('DOMContentLoaded', function () {
    // Inicializar el mapa
    var map = L.map('map').setView([19.4326, -99.1332], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // D. Ejemplo con array de CDMX, Merida, Aguascalientes y Querétaro co la variable puntos

    // Define las coordenadas de la Ciudad de México, Mérida, Aguascalientes y Querétaro
    var cdmx = { lat: 19.4326, lng: -99.1332 };
    var merida = { lat: 20.9674, lng: -89.5926 };
    var aguascalientes = { lat: 21.8853, lng: -102.2916 };
    var queretaro = { lat: 20.5888, lng: -100.3899 };

    var puntos = [
        { lat: cdmx.lat, lng: cdmx.lng, desc: 'Popocatépetl' },
        { lat: merida.lat, lng: merida.lng, desc: 'Iztaccíhuatl' },
        { lat: aguascalientes.lat, lng: aguascalientes.lng, desc: 'Pico de Orizaba' },
        { lat: queretaro.lat, lng: queretaro.lng, desc: 'Nevado de Toluca' }
    ];

    // B. Estructuras iterativas con operadores lógicos
    puntos.forEach(punto => {
        L.marker([punto.lat, punto.lng]).addTo(map)
            .bindPopup("Sede CentroGeo" + ' <br> ' + punto.desc)
    });

    var form = document.getElementById('coordinateForm');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        var latitude = parseFloat(document.getElementById('latitud').value);
        var longitude = parseFloat(document.getElementById('longitud').value);
        var etiqueta = document.getElementById('etiqueta').value;

        // A. Estructura condicional múltiple
        if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            alert('Por favor, introduce coordenadas válidas.');
            return;
        }

        // Agregar marcador al mapa
        L.marker([latitude, longitude]).addTo(map)
            .bindPopup(etiqueta)
            .openPopup();

        // Validar otros campos
        var password = document.getElementById('password').value;
        var selectExample = document.getElementById('select').value;
        var checkboxExample = document.getElementById('checkbox').checked;
        var radioExample = document.querySelector('input[name="radio"]:checked').value;

        // Calcular la distancia entre la Ciudad de México y la coordenada introducida
        var distanciaCdmx = distancia(cdmx.lat, cdmx.lng, latitude, longitude);
        console.log('Distancia entre Ciudad de México y coordenada introducida: ' + distanciaCdmx + ' km');
        // Calcular la distancia entre Mérida y la coordenada introducida
        var distanciaMerida = distancia(merida.lat, merida.lng, latitude, longitude);
        console.log('Distancia entre Mérida y coordenada introducida: ' + distanciaMerida + ' km');
        // Calcular la distancia entre Aguascalientes y la coordenada introducida
        var distanciaAguascalientes = distancia(aguascalientes.lat, aguascalientes.lng, latitude, longitude);
        console.log('Distancia entre Aguascalientes y coordenada introducida: ' + distanciaAguascalientes + ' km');
        // Calcular la distancia entre Querétaro y la coordenada introducida
        var distanciaQueretaro = distancia(queretaro.lat, queretaro.lng, latitude, longitude);
        console.log('Distancia entre Querétaro y coordenada introducida: ' + distanciaQueretaro + ' km');
        // Calcular la suma de las coordenadas de Ciudad de México y la introducida
        var sumaCdmx = sumarCoords(cdmx.lat, cdmx.lng, latitude, longitude);

        // Pone los resultado en el div de contenido-texto
        document.getElementById('contenido-resultados').innerHTML = '<h2>Resultados del Formulario</h2>' +
            '<p<Latitud: ' + latitude + '</p>' +
            '<p>Longitud: ' + longitude + '</p>' +
            '<p>Sede: ' + etiqueta + '</p>' +
            '<p>Contraseña: ' + password + '</p>' +
            '<p>Categoria: ' + selectExample + '</p>' +
            '<p>Finalizada: ' + checkboxExample + '</p>' +
            '<p>Tipo: ' + radioExample + '</p>' +
            '<h3>Resultados de las distancias</h3>'+
            '<p>Distancia entre Ciudad de México y coordenada introducida: ' + distanciaCdmx + ' km</p>' +
            '<p>Distancia entre Mérida y coordenada introducida: ' + distanciaMerida + ' km</p>' +
            '<p>Distancia entre Aguascalientes y coordenada introducida: ' + distanciaAguascalientes + ' km</p>' +
            '<p>Distancia entre Querétaro y coordenada introducida: ' + distanciaQueretaro + ' km</p>' +
            '<p>Suma de las coordenadas de Ciudad de México y la introducida: ' + sumaCdmx + '</p>';
    });

    // G. Ejemplo con eventos de ratón
    document.getElementById('latitud').addEventListener('mouseover', function () {
        console.log('Mouse sobre el campo de latitud');
    });

    document.getElementById('longitud').addEventListener('mouseout', function () {
        console.log('Mouse fuera del campo de longitud');
    });

    // Evento click del botón sobre el mapa para que se muestre la latitud y longitud en un popup sobre el mapa
    map.on('click', function (e) {
        var popup = L.popup()
            .setLatLng(e.latlng)
            // Reduce el número de decimales a 4
            .setContent('Latitud: ' + e.latlng.lat.toFixed(4) + '<br>Longitud: ' + e.latlng.lng.toFixed(4))
            .openOn(map);
    });

    // C. Funciones con argumentos fijos y variables que retornen valores
    function distancia(lat1, lon1, lat2, lon2) {
        var radlat1 = Math.PI * lat1 / 180;
        var radlat2 = Math.PI * lat2 / 180;
        var theta = lon1 - lon2;
        var radtheta = Math.PI * theta / 180;
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
        dist = Math.acos(dist);
        dist = dist * 180 / Math.PI;
        dist = dist * 60 * 1.1515;
        return dist;
    }

    function sumarCoords(lat1, lon1, lat2, lon2) {
        return [lat1 + lat2, lon1 + lon2];
    }   


    // E. Ejemplo con strings con la descripción de los puntos
    var puntosString = puntos.map(punto => punto.desc).join(', ');
    console.log(puntosString);
});