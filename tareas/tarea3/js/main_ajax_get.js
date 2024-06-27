$(document).ready(function(){
    $('#envio_get').submit(function() {
	  // Recuperar valores de formulario 
	  //alert("Estilo Javascript: " + tipo.options[tipo.selectedIndex].text);
	  //alert("JQuery: "+ $('#tipo option:selected').html())
    event.preventDefault(); // Prevenir el envío del formulario

    // Validar campos
    var clase = $('#clase').val();
    var entidad = $('#entidad option:selected').val();
    var tamanio = $('input[name="tamanio"]:checked').val();

    if (!clase || !entidad || !tamanio) {
        alert("Por favor, complete todos los campos antes de enviar.");
        return false;
    }

      var URL = 'php/listaInst_get.php';
      var contenido_html = "";
      var ajax_get = $.ajax({
	  type : "GET",
      url : URL,
      dataType : 'json',
	  contentType: 'application/json',
      timeout:10000,
	  data: {
    clase: $('#clase').val(),
		entidad: $('#entidad option:selected').val(),
    tamanio: $('input[name="tamanio"]:checked').val()
	  },
	  beforeSend : function() { 
				alert("Esperando respuesta desde servidor ubuntu");
	  },
      success : function (response) {
				//console.log(response);
				$('#contenido').html('');
				//alert("Se obtuvieron: "+ response.length + " resultados");
				//Itera sobre los valores obtenidos
				if(response.length > 0) {
					for (var i in response) {
					contenido_html = "Nombre: " + response[i].nombre + "<br/>";
					contenido_html += "Tipo: " + response[i].tipo + "<br/>";
					contenido_html += "Municipio: " + response[i].delmun + "<br/>";
					contenido_html += "Entidad: "  + response[i].entidad + "<br/>";
					contenido_html += "Sector: "  + response[i].sector + "<br/>";
					contenido_html += "Rama: "  + response[i].rama + "<br/>";
					contenido_html += "Clase: "  + response[i].clase + "<br/>";
          contenido_html += "Tamaño: "  + response[i].tamanio + "<br/>";
					contenido_html += "<hr/>";
					$('#contenido').append(contenido_html);
				} //fin del for	
				} else {
					contenido_html = "La consulta no tiene resultados" + "<br/>";
					$('#contenido').append(contenido_html);
				}
			},
			error : function(jqXHR, estado, error) {
				$('#contenido').html('Se produjo un error:' + estado + ' error: ' + error);
			},
			complete : function(jqXHR, estado) {
				alert("Se ha completado la solicitud al WS con el estado: " + estado);
			}
      }); //fin del componente Ajax

			//previene el re-envío del requerimiento
			return false;
		}); //fin del evento submit
	}); //fin de document.ready function
