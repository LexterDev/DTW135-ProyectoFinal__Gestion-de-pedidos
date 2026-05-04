# Documentación de Nominatim

## ¿Qué es Nominatim?

Nominatim es un servicio de geocodificación proporcionado por OpenStreetMap. Permite convertir coordenadas geográficas (latitud y longitud) en direcciones legibles, y también puede hacer el proceso inverso.

En este proyecto se usa Nominatim para obtener una ubicación legible a partir de la posición del usuario cuando activa la geolocalización en el checkout.

## Endpoint 

Se usa el endpoint de geocodificación inversa (reverse geocoding):

`https://nominatim.openstreetmap.org/reverse?format=json&lat=<lat>&lon=<lon>`

### Parámetros principales

- `format=json`: solicita la respuesta en formato JSON.
- `lat=<lat>`: latitud del punto geográfico.
- `lon=<lon>`: longitud del punto geográfico.

### Ejemplo de petición

```http
, 
GET https://nominatim.openstreetmap.org/reverse?format=json&lat=13.9702885233717&lon=-89.57310690198048
```

### Ejemplo de respuesta

```json
{
    "place_id": 309734372,
    "licence": "Data © OpenStreetMap contributors, ODbL 1.0. http://osm.org/copyright",
    "osm_type": "way",
    "osm_id": 245861404,
    "lat": "13.9704610",
    "lon": "-89.5744072",
    "class": "amenity",
    "type": "university",
    "place_rank": 30,
    "importance": 0.00005281071183332597,
    "addresstype": "amenity",
    "name": "Universidad de El Salvador - Facultad Multidisciplinaria de Occidente",
    "display_name": "Universidad de El Salvador - Facultad Multidisciplinaria de Occidente, Senda 3, Urbanización Altos del Palmar, Santa Ana, Santa Ana Centro, Santa Ana, 2201, El Salvador",
    "address": {
        "amenity": "Universidad de El Salvador - Facultad Multidisciplinaria de Occidente",
        "road": "Senda 3",
        "neighbourhood": "Urbanización Altos del Palmar",
        "city": "Santa Ana",
        "district": "Santa Ana",
        "municipality": "Santa Ana Centro",
        "state": "Santa Ana",
        "ISO3166-2-lvl4": "SV-SA",
        "postcode": "2201",
        "country": "El Salvador",
        "country_code": "sv"
    },
    "boundingbox": [
        "13.9688981",
        "13.9722429",
        "-89.5771427",
        "-89.5727840"
    ]
}
```

## ¿Para qué sirve en la app?

Cuando el usuario activa la geolocalización, la app realiza una petición a Nominatim para mostrar una etiqueta de ubicación comprensible. 

Nominatim es un servicio público ofrecido por OpenStreetMap. No es una API propia del proyecto, por lo que se debe usar con moderación y respetando sus políticas.

Utilidad:

- Confirmar que la ubicación fue detectada correctamente
- Mejorar la experiencia del usuario
- Elegir la sucursal de retiro más cercana de forma más intuitiva
