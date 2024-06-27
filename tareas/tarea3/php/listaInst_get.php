<?php
 //1. Establece una conexión a PostgreSQL
 $connection=pg_connect ("host=localhost dbname=siicyt port=5432 user=postgres password=ubuntu");
 if (!$connection) {
   die("No se ha podido establecer conexion con la bd.  ");
   exit;
 }
$clase = isset($_GET['clase']) ? strtoupper($_GET['clase']) : '';
$entidad = $_GET['entidad'];
$tamanio = $_GET['tamanio'];
//2. Generar una consulta a la base de datos
$query = "SELECT nombre,tipo,delmun,entidad,sector,rama,clase,tamanio FROM reniecyt2013a ";
if(isset($entidad)) {
  $query = $query."WHERE entidad = '".$entidad."' AND clase LIKE '%" . pg_escape_string($clase) . "%' AND tamanio = '".$tamanio."'";
}

$query = $query."ORDER BY NOMBRE LIMIT 50";
//echo($query);
//3. Obtiene resultados
$result = pg_query($query);
if(!$result) {
  die("La consulta no es válida ".pg_error());
}

//Otra manera de devolver resultados
$data = array();
while($row = @pg_fetch_assoc($result)) {
  array_push($data,$row);
}
//Retorna datos en formato JSON
echo json_encode($data); 
?>
