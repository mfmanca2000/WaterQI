import React, { useEffect, useState } from 'react'
import databaseService from '../appwrite/database.js'
import { readString, usePapaParse } from 'react-papaparse'
import FileUploader from '../components/FileUploader.jsx';


/*
0: PROVINCIA
1: COMUNE
2: STAZIONE
3: DATA (01.01.2016)
4: PARAMETRO
5: VALORE
6: LAT
7: LON
*/




function ExtractLombardiaDataSet() {
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
                        if (counter == 1) return; // skip first line with headers
                        else {

                            console.log('Locations inserted so far: ' + locations.length)


                            if (isNaN(r[6]) || isNaN(r[7])) return;

                            var lat = Number(r[6])
                            var lon = Number(r[7])
                            
                            let placeDescription = r[2]

                            var dateParts = r[3].split(".");
                            var date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

                            

                            //console.log(placeDescription)
                            //console.log(long_lat[1] + ' - ' + long_lat[0])
                            //console.log(date)

                            const locationsAround = databaseService.getAllLocationsAroundFromList(locations, lat, lon, 100);
                            if (locationsAround.length === 0) {

                                const measure = {
                                    $id: null,
                                    electricatConductivity: r[4]?.includes('Conducibilit') ? Number(r[5]) : null,
                                    pH: r[4].includes('pH') ? Number(r[5]) : null,
                                    temperature: r[4].includes('Temperatura acqua') ? Number(r[5]) : null,
                                    escherichiaColi: r[4].includes('Escherichia') ? Number(r[5]) : null,
                                    dissolvedOxygen: r[4].includes('Ossigeno disciolto') ? Number(r[5]) : null,
                                    userId: 'importer',
                                    placeDescription: placeDescription,
                                    datetime: date,
                                    latitude: lat,
                                    longitude: lon
                                }
                                const loc = { $id: null, userId: 'importer', username: null, name: r[1] + ' (' + r[0] + ')', latitude: lat, longitude: lon, imageId: null, measures: [measure] }
                                locations.push(loc)
                                console.log('Added new location')

                            } else {

                                const measureInDate = locationsAround[0].measures.filter((m) => {
                                    //console.log('Existing: ' + m.datetime)
                                    //console.log('This line: ' + date)
                                    return m.datetime.getTime() === date.getTime()
                                })

                                if (measureInDate.length === 1) {
                                    if (r[4]?.includes('Conducibilit')) {
                                        measureInDate[0].electricatConductivity = Number(r[5])
                                    }
                                    if (r[4].includes('pH')) {
                                        measureInDate[0].pH = Number(r[5])
                                    }                                    
                                    if (r[4].includes('Temperatura acqua')) {
                                        measureInDate[0].temperature = Number(r[5])
                                    }
                                    if (r[4].includes('Escherichia')) {
                                        measureInDate[0].escherichiaColi = Number(r[5])
                                    }
                                    if (r[4].includes('Ossigeno disciolto')) {
                                        measureInDate[0].dissolvedOxygen = Number(r[5])
                                    }


                                    console.log('Corrected existing measure')

                                } else {
                                    const measure = {
                                        $id: null,
                                        electricatConductivity: r[4]?.includes('Conducibilit') ? Number(r[5]) : null,
                                        pH: r[4].includes('pH') ? Number(r[5]) : null,
                                        temperature: r[4].includes('Temperatura acqua') ? Number(r[5]) : null,
                                        escherichiaColi: r[4].includes('Escherichia') ? Number(r[5]) : null,
                                        dissolvedOxygen: r[4].includes('Ossigeno disciolto') ? Number(r[5]) : null,
                                        userId: 'importer',
                                        placeDescription: placeDescription,
                                        datetime: date,
                                        latitude: lat,
                                        longitude: lon
                                    }
                                    locationsAround[0].measures.push(measure)
                                    console.log('Added measure to existing location')
                                }

                            }
                        }
                    });

                    const locationsJSON = JSON.stringify({ locations: { documents: locations } });

                    download(locationsJSON, 'exportedLombardia.json', 'text/plain');
                }
            });
        }


        reader.readAsText(file);
    };
    
    return <FileUploader handleFile={handleReadRemoteFile} text='Start' />
}

export default ExtractLombardiaDataSet