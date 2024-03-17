import React, { useEffect, useState } from 'react'
import databaseService from '../appwrite/database.js'
import { usePapaParse } from 'react-papaparse'
import { Button } from 'flowbite-react';
import proj4 from 'proj4';

/*
0: Luogo;
1: Lat_GB;
2: Lon_GB;
3: Data
4: Conducibilità;
5: PH;
6: Solidi sospesi;
7: Temperatura;
*/


const filename = 'Liguria.csv'



export default function ExtractLiguriaDataSet() {
    const [results, setResults] = useState([])
    const { readRemoteFile } = usePapaParse();

    var GAUSS_BOAGA = '+proj=tmerc +ellps=intl +lat_0=0 +lon_0=9+x_0=1500000 +y_0=0 +k=0.9996 +towgs84=-225,-65,9,0,0,0,0';
    var WGS84 = "+title=long/lat:WGS84 +proj=longlat +a=6378137.0 +b=6356752.31424518 +ellps=WGS84 +datum=WGS84 +units=degrees";



    function download(content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    useEffect(() => {


    }, [results])


    const handleReadRemoteFile = () => {
        readRemoteFile(filename, {
            fastMode: false,
            complete: (results) => {
                console.log('Results: ' + results.data.length)

                setResults(results)

                let counter = 0;
                const locations = [];

                results?.data?.forEach((r) => {
                    counter++
                    if (counter == 1) return; // skip first line with headers                    
                    else {

                        console.log('Locations inserted so far: ' + locations.length)

                        

                        if (isNaN(r[2]) || isNaN(r[1])) return;

                        var dateParts = r[3].split("/");                        
                        var datetime = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

                        var long_lat = proj4(GAUSS_BOAGA, WGS84, [Number(r[2]), Number(r[1])])

                        const locationsAround = databaseService.getAllLocationsAroundFromList(locations, long_lat[1], long_lat[0], 100);
                        if (locationsAround.length === 0) {

                            const measure = { $id: null, electricatConductivity: r[4] != '' ? Number(r[4]) : null, pH: r[5] != '' ? Number(r[5]) : null, totalDissolvedSolids: r[6] != '' ? Number(r[6]) : null, temperature: r[7] != '' ? Number(r[7]) : null, userId: 'importer', placeDescription: r[0], datetime: datetime, latitude: long_lat[1], longitude: long_lat[0] }
                            const loc = { $id: null, userId: 'importer', username: null, name: r[0], latitude: long_lat[1], longitude: long_lat[0], imageId: null, measures: [measure] }
                            locations.push(loc)
                            console.log('Added new location')

                        } else {

                            const measure = { $id: null, electricatConductivity: r[4] != '' ? Number(r[4]) : null, pH: r[5] != '' ? Number(r[5]) : null, totalDissolvedSolids: r[6] != '' ? Number(r[6]) : null, temperature: r[7] != '' ? Number(r[7]) : null, userId: 'importer', placeDescription: r[0], datetime: datetime, latitude: long_lat[1], longitude: long_lat[0] }
                            locationsAround[0].measures.push(measure)
                            console.log('Added measure to existing location')

                        }
                    }
                });


                const locationsJSON = JSON.stringify({ locations: { documents: locations } });

                download(locationsJSON, 'exportedLiguria.json', 'text/plain');
            }
        })
    }


    return <Button className='rounded bg-red-500 h-12 mt-2' onClick={() => handleReadRemoteFile()}>Start</Button>;
}