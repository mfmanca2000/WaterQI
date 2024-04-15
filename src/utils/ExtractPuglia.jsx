import React, { useEffect, useState } from 'react'
import databaseService from '../appwrite/database.js'
import { readString, usePapaParse } from 'react-papaparse'
import FileUploader from '../components/FileUploader'


/*
0: Luogo;
3: Data (solo anno);
4: Temperatura
5: Conducibilità;
6: PH;
8: Ossigeno disciolto
21: Escherichia Coli
22: Limeco
23: Lat (41°51' 36,2" N)
24: Lon (15°07'24" E)
*/

function ParseDMS(input) {
    var parts = input.split(/[^\d\w\.]+/);   
    //console.log('Input: ' + input + ' --> ' + parts) 
    var lat = ConvertDMSToDD(Number(parts[0]), Number(parts[1]), Number(parts[2]), Number(parts[3]));
    var lng = ConvertDMSToDD(Number(parts[4]), Number(parts[5]), Number(parts[6]), Number(parts[7]));

    return {
        Latitude : lat,
        Longitude: lng,
        Position : lat + ',' + lng
    }
}

function ConvertDMSToDD(degrees, minutes, seconds, direction) {
    var dd = degrees + minutes/60 + seconds/(60*60);

    if (direction == "S" || direction == "W") {
        dd = dd * -1;
    } // Don't do anything for N or E
    return dd;
}



function ExtractPugliaDataSet() {
    const [results, setResults] = useState([])
    const { readRemoteFile } = usePapaParse();

    function download(content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    useEffect(() => {


    }, [results])


    const handleReadRemoteFile = (file) => {
        var reader = new FileReader();
        reader.onload = function (event) {

            readString(event.target.result, {
                fastMode: false,
                complete: (results) => {
                    console.log('Results: ' + results.data.length)

                    setResults(results)

                    let counter = 0;
                    const locations = [];

                    results?.data?.forEach((r) => {
                        counter++
                        if (counter <= 3) return; // skip first 3 line with headers                    
                        else {

                            if (r[23] == '' || r[23] == null) return

                            console.log('Locations inserted so far: ' + locations.length)
                                                        
                            var datetime = new Date(r[3], 0, 1);                            

                            var lat_lon = ParseDMS(r[23].replace(' ','').replace(',','.') + ' ' + r[24].replace(' ','').replace(',','.'))

                            //console.log('Date: ' + datetime)
                            //console.log('Lat_Lon: ' + JSON.stringify(lat_lon))

                            const locationsAround = databaseService.getAllLocationsAroundFromList(locations, lat_lon.Latitude, lat_lon.Longitude, 100);
                            const measure = { $id: null, electricatConductivity: r[5] != '' ? Number(r[5]) : null, pH: r[6] != '' ? Number(r[6]) : null, temperature: r[4] != '' ? Number(r[4]) : null, dissolvedOxagen: r[8] != '' ? Number(r[8]) : null, escherichiaColi: r[21] != '' ? Number(r[21]) : null, limeco: r[22] != '' ? Number(r[22]) : null, userId: 'importer', placeDescription: r[0], datetime: datetime, latitude: lat_lon.Latitude, longitude: lat_lon.Longitude }
                            if (locationsAround.length === 0) {
                                const loc = { $id: null, userId: 'importer', username: null, name: r[0], latitude: lat_lon.Latitude, longitude: lat_lon.Longitude, imageId: null, measures: [measure] }
                                locations.push(loc)
                                console.log('Added new location')
                            } else {
                                locationsAround[0].measures.push(measure)
                                console.log('Added measure to existing location')
                            }
                        }
                    });


                    const locationsJSON = JSON.stringify({ locations: { documents: locations } });

                    download(locationsJSON, 'exportedPuglia.json', 'text/plain');
                }
            })
        }

        reader.readAsText(file);
    }


    return <FileUploader handleFile={handleReadRemoteFile} text='Start' />
}

export default ExtractPugliaDataSet