<?php
// Establece una conexión a PostgreSQL
$connection = pg_connect("host=localhost dbname=siicyt port=5432 user=postgres password=ubuntu");
if (!$connection) {
    header('Content-Type: application/json');
    echo json_encode(["error" => "No se ha podido establecer conexion con la bd."]);
    exit;
}

// Función para ejecutar una consulta y devolver un FeatureCollection
function getFeatureCollection($query) {
    global $connection;
    $result = pg_query($connection, $query);
    if (!$result) {
        return ["error" => "La consulta no es válida: " . pg_last_error($connection)];
    }

    $features = [];
    while ($row = pg_fetch_assoc($result)) {
        $geometry = json_decode($row['coords']);
        unset($row['coords']);
        $feature = ["type" => "Feature", "geometry" => $geometry, "properties" => $row];
        array_push($features, $feature);
    }
    return ["type" => "FeatureCollection", "features" => $features];
}

// Función para ejecutar una consulta y devolver un resultado único
function getDistance($query) {
  global $connection;
  $result = pg_query($connection, $query);
  if (!$result) {
      return ["error" => "La consulta no es válida: " . pg_last_error($connection)];
  }
  $row = pg_fetch_assoc($result);
  return $row;
}

// Recoge los datos del formulario
$instituciones = $_POST['instituciones'];
$centros = $_POST['centros'];
$distancia = $_POST['distancia'];
$instituciones_km = $_POST['instituciones_km'];
$calcular_linea = isset($_POST['calcular_linea']) && $_POST['calcular_linea'] === 'true';

$response = [];

$centrogeo_query = "WITH centrogeo AS (
    SELECT geom
    FROM public.reniecyt2013a
    WHERE nombre = 'CENTRO DE INVESTIGACION EN GEOGRAFIA Y GEOMATICA INGENIERO JORGE L TAMAYO AC'
) ";

// Consulta para instituciones
$query = $centrogeo_query . "SELECT 
        ra.nombre, 
        ra.tipo, 
        ra.delmun, 
        ra.entidad, 
        ra.sector, 
        ra.rama, 
        ra.clase, 
        ra.tamanio, 
        ST_AsGeoJson(ra.geom, 5) AS coords,
        ST_Distance(ra.geom, c.geom) AS distancia
    FROM reniecyt2013a ra, centrogeo c
    ORDER BY ra.geom <-> c.geom
    LIMIT " . intval($instituciones);
$response['instituciones'] = getFeatureCollection($query);

// Consulta para centros
$query = $centrogeo_query . "SELECT 
        ra.nombre, 
        ra.tipo, 
        ra.delmun, 
        ra.entidad, 
        ra.sector, 
        ra.rama, 
        ra.clase, 
        ra.tamanio, 
        ST_AsGeoJson(ra.geom, 5) AS coords,
        ST_Distance(ra.geom, c.geom) AS distancia
    FROM reniecyt2013a ra, centrogeo c
    WHERE ra.tipo = 'CENTROS DE INVESTIGACION'
    ORDER BY ra.geom <-> c.geom
    LIMIT " . intval($centros);
$response['centros'] = getFeatureCollection($query);

// Determina las coordenadas según el valor de distancia
if ($distancia === 'raul') {
  $lat = 19.372607902064843;
  $lon = -99.15039437442931;
} elseif ($distancia === 'uriel') {
  $lat = 19.409661329967356;
  $lon = -98.89612437593784;
} else {
  $lat = 19.2916667;
  $lon = -99.2213888888889;
}

// Factor de conversión de grados a kilómetros
$degree_to_km = 40000 / 360;

// Consulta para calcular la distancia en kilómetros desde centrogeo a las coordenadas dadas
$query = $centrogeo_query . "SELECT 
      (ST_Distance(c.geom, ST_SetSRID(ST_MakePoint($lon, $lat), 4326)) * $degree_to_km) AS distancia_km
  FROM centrogeo c
  LIMIT 1";

$response['distancia'] = getDistance($query);

// Consulta para instituciones dentro de la distancia máxima especificada
$query = $centrogeo_query . "SELECT 
        ra.nombre, 
        ra.tipo, 
        ra.delmun, 
        ra.entidad, 
        ra.sector, 
        ra.rama, 
        ra.clase, 
        ra.tamanio, 
        ST_AsGeoJson(ra.geom, 5) AS coords,
        (ST_Distance(ra.geom, c.geom) * $degree_to_km) AS distancia_km
    FROM reniecyt2013a ra, centrogeo c
    WHERE (ST_Distance(ra.geom, c.geom) * $degree_to_km) <= " . floatval($instituciones_km) . "
    ORDER BY ra.geom <-> c.geom";

$response['instituciones_km'] = getFeatureCollection($query);

// Consulta para crear la línea y devolver la geometría en formato GeoJSON
if ($calcular_linea) {
  $line_query = $centrogeo_query . "SELECT ST_AsGeoJSON(ST_MakeLine(
                      ST_SetSRID(ST_MakePoint($lon, $lat), 4326),
                      c.geom
                  )) AS line_geom
              FROM centrogeo c
              LIMIT 1";
  $line_result = pg_query($connection, $line_query);
  if ($line_result) {
      $line_row = pg_fetch_assoc($line_result);
      $response['linea'] = json_decode($line_row['line_geom']);
  } else {
      $response['linea'] = ["error" => "La consulta de línea no es válida: " . pg_last_error($connection)];
  }
}

// Limpia el buffer de salida y establece el encabezado JSON
ob_clean();
header('Content-Type: application/json');
echo json_encode($response);

?>
