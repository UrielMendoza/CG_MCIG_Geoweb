<?php
// 1. Establece una conexión a PostgreSQL
$connection = pg_connect("host=localhost dbname=siicyt port=5432 user=postgres password=ubuntu");
if (!$connection) {
    header('Content-Type: application/json');
    echo json_encode(["error" => "No se ha podido establecer conexion con la bd."]);
    exit;
}

$clase = isset($_POST['clase']) ? strtoupper($_POST['clase']) : '';
$clase = pg_escape_string($clase);
$tamanio = $_POST['tamanio'];

// 2. Generar una consulta a la base de datos
$query = "SELECT nombre, tipo, delmun, entidad, sector, rama, clase, tamanio, ST_AsGeoJson(geom, 5) as coords FROM reniecyt2013a ";
$whereClauses = [];

if (!empty($clase)) {
    $whereClauses[] = "(nombre ILIKE '%" . $clase . "%' 
                        OR tipo ILIKE '%" . $clase . "%' 
                        OR delmun ILIKE '%" . $clase . "%' 
                        OR entidad ILIKE '%" . $clase . "%' 
                        OR sector ILIKE '%" . $clase . "%' 
                        OR rama ILIKE '%" . $clase . "%' 
                        OR clase ILIKE '%" . $clase . "%')";
}

if (!empty($tamanio)) {
    $whereClauses[] = "tamanio = '" . $tamanio . "'";
}

if (!empty($whereClauses)) {
    $query .= "WHERE " . implode(' AND ', $whereClauses) . " ";
}

$query .= "ORDER BY nombre LIMIT 50";

// 3. Obtiene resultados
$result = pg_query($query);
if (!$result) {
    header('Content-Type: application/json');
    echo json_encode(["error" => "La consulta no es válida: " . pg_last_error()]);
    exit;
}

$features = [];
while ($row = @pg_fetch_assoc($result)) {
    $geometry = json_decode($row['coords']);
    unset($row['coords']);
    $feature = ["type" => "Feature", "geometry" => $geometry, "properties" => $row];
    array_push($features, $feature);
}

$featureCollection = ["type" => "FeatureCollection", "features" => $features];

// Limpiar el buffer de salida y establecer el encabezado JSON
ob_clean();
header('Content-Type: application/json');
echo json_encode($featureCollection);
?>
