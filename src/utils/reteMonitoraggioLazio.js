import fs from "fs";
import geojson from 'geojson';

function extractPointsFromGeojson(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    const geojsonData = JSON.parse(data);
    const points = [];

    if (geojsonData.type === 'FeatureCollection') {
        geojsonData.features.forEach(feature => {
            if (feature.geometry.type === 'Point') {
                points.push({ cod_pnt: feature.properties.cod_pnt, coordinates: feature.geometry.coordinates });
            }
        });
    } else if (geojsonData.type === 'Feature' && geojsonData.geometry.type === 'Point') {
        points.push(geojsonData.geometry.coordinates);
    }

    // Convert array of objects to CSV string
    const csvRows = points.map(item => `${item.cod_pnt},${item.coordinates[0]},${item.coordinates[1]}`);
    const csvString = 'cod_pnt,longitude,latitude\n' + csvRows.join('\n');

    // Write CSV string to a file
    const output = 'C:\\dev\\WaterQI\\importOriginali\\monitoraggio-lazio.csv';
    fs.writeFile(output, csvString, 'utf8', (err) => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }
        console.log('Data has been written to', output);
    });
    return points;
}

// Example usage:
const filePath = 'C:\\dev\\WaterQI\\importOriginali\\monitoraggio-lazio.geojson.json';
const points = extractPointsFromGeojson(filePath);
//console.log(points);