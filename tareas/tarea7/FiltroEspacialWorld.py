import json
import psycopg2
from pywps import Process, LiteralInput, LiteralOutput, Format
from osgeo import ogr
import logging
import time

class FiltroEspacialWorld(Process):
    def __init__(self):
        inputs = [
            LiteralInput('geo', 'Geometria', abstract="Geometría wkt, json, o gml", data_type='string', min_occurs=0),
        ]
        outputs = [
            LiteralOutput('output', 'FiltroEspacialWorld(Geometría)', abstract="Resultado como cadena", data_type="string"),
        ]

        super(FiltroEspacialWorld, self).__init__(
            self._handler,
            identifier='FiltroEspacialWorld',
            version='1.0',
            title='Consulta espacial sobre la bd world',
            abstract='Se realizan consultas a una capa de info vectorial en BD a partir de una geometría de entrada',
            profile='',
            inputs=inputs,
            outputs=outputs,
            store_supported=True,
            status_supported=True
        )

    def _handler(self, request, response):
        geometrias = []
        geo_value = request.inputs['geo'][0].data
        if geo_value:
            try:
                geometria = ogr.CreateGeometryFromWkt(geo_value)
                sr = ogr.osr.SpatialReference()
                sr.ImportFromEPSG(4326)
                geometria.AssignSpatialReference(sr)
            except Exception as e:
                response.update_status("Error al procesar la geometría de entrada.", 100)
                response.outputs['output'].data = f"Error: {str(e)}"
                return response

            if geometria:
                geometrias.append(geometria)
            else:
                response.update_status("Geometría de entrada no válida.", 100)
                response.outputs['output'].data = "Geometría de entrada no válida."
                return response
        else:
            response.update_status("No hay datos para realizar la operación.", 100)
            response.outputs['output'].data = "No hay datos para realizar la operación."
            return response

        dic_geojson = {'type': 'FeatureCollection', 'features': []}
        try:
            conexionBD = psycopg2.connect(host='localhost', dbname='world', user='postgres', password='ubuntu', port=5432)
            cursor = conexionBD.cursor()

            for geometria in geometrias:
                # Asegurar que la geometría tenga el SRID correcto
                wkt_geom = geometria.ExportToWkt()
                strSQL = """
                SELECT id, fid, fips, iso2, iso3, un, name, area, pop2005, region, subregion, lon, lat, ST_AsBinary(geom) 
                FROM world_borders 
                WHERE ST_Intersects(geom, ST_GeomFromText(%s, 4326))
                """
                cursor.execute(strSQL, (wkt_geom,))
                registros = cursor.fetchall()

                for registro in registros:
                    id, fid, fips, iso2, iso3, un, name, area, pop2005, region, subregion, lon, lat, geom_bytes = registro
                    res_geometria = ogr.CreateGeometryFromWkb(geom_bytes)
                    geometria_json = json.loads(res_geometria.ExportToJson())
                    propiedades = {
                        'id': id,
                        'fid': fid,
                        'fips': fips,
                        'iso2': iso2,
                        'iso3': iso3,
                        'un': un,
                        'name': name,
                        'area': str(area),
                        'pop2005': pop2005,
                        'region': region,
                        'subregion': subregion,
                        'lon': lon,
                        'lat': lat
                    }
                    feature = {'type': 'Feature', 'properties': propiedades, 'geometry': geometria_json}
                    dic_geojson['features'].append(feature)

            response.outputs['output'].data = json.dumps(dic_geojson)
            cursor.close()
            conexionBD.close()
        except Exception as e:
            response.outputs['output'].data = f"Error: {str(e)}"

        return response

