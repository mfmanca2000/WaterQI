import React, { useEffect, useState } from 'react'
import databaseService from '../appwrite/database.js'
import { readString, usePapaParse } from 'react-papaparse'
import { Button } from 'flowbite-react';
import proj4 from 'proj4';
import FileUploader from '../components/FileUploader.jsx';


/*
1: data
2: parametro
5: valore
8: cod_staz
9: nome
10: latitudine
11: longitudine
*/



export default function ExtractLazioDataSet() {
    const [results, setResults] = useState([])
    const { readRemoteFile } = usePapaParse();

    function parseDate(s) {        
        var p = s.split(' ');
        var d = p[0].split('.')
        return new Date(d[2],d[1] - 1,d[0])
    }


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


                            if (isNaN(r[10]) || isNaN(r[11])) return;

                            let placeDescription = r[9]

                            // var dateParts = r[3].split(".");
                            // var date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

                            var date = parseDate(r[1])


                            //console.log(placeDescription)
                            //console.log(long_lat[1] + ' - ' + long_lat[0])
                            //console.log('Parsed date: ' + date)

                            const locationsAround = databaseService.getAllLocationsAroundFromList(locations, r[10], r[11], 100);
                            if (locationsAround.length === 0) {

                                const measure = {
                                    $id: null,
                                    electricatConductivity: r[2]?.includes('CONDUCIBILITA') ? Number(r[5]) : null,
                                    pH: r[2].includes('pH') ? Number(r[5].replace(/,/g, '.')) : null,
                                    temperature: r[2].includes('TEMPERATURA') ? Number(r[5].replace(/,/g, '.')) : null,
                                    salinity: r[2].includes('SALINITA') ? Number(r[5].replace(/,/g, '.')) : null,
                                    dissolvedOxygen: r[2].includes('OSSIGENO') ? Number(r[5].replace(/,/g, '.')) : null,
                                    escherichiaColi: r[2].includes('ESCHERICHIA') ? Number(r[5].replace(/,/g, '.')) : null,
                                    userId: 'importer',
                                    placeDescription: placeDescription,
                                    datetime: date,
                                    latitude: r[10],
                                    longitude: r[11]
                                }
                                const loc = { $id: null, userId: 'importer', username: null, name: placeDescription, latitude: r[10], longitude: r[11], imageId: null, measures: [measure] }
                                locations.push(loc)
                                console.log('Added new location')

                            } else {

                                const measureInDate = locationsAround[0].measures.filter((m) => {
                                    //console.log('Existing: ' + m.datetime)
                                    //console.log('This line: ' + date)
                                    return m.datetime.getTime() === date.getTime()
                                })

                                if (measureInDate.length === 1) {
                                    if (r[2]?.includes('CONDUCIBILITA')) {
                                        measureInDate[0].electricatConductivity = Number(r[5])
                                    }
                                    if (r[2].includes('pH')) {
                                        measureInDate[0].pH = Number(r[5])
                                    }
                                    if (r[2].includes('TEMPERATURA')) {
                                        measureInDate[0].temperature = Number(r[5])
                                    }
                                    if (r[2].includes('SALINITA')) {
                                        measureInDate[0].salinity = Number(r[5].replace(/,/g, '.'))
                                    }
                                    if (r[2].includes('OSSIGENO')) {
                                        measureInDate[0].dissolvedOxygen = Number(r[5].replace(/,/g, '.'))
                                    }
                                    if (r[2].includes('ESCHERICHIA')) {
                                        measureInDate[0].escherichiaColi = Number(r[5].replace(/,/g, '.'))
                                    }


                                    console.log('Corrected existing measure')

                                } else {
                                    const measure = {
                                        $id: null,
                                        electricatConductivity: r[2]?.includes('CONDUCIBILITA') ? Number(r[5].replace(/,/g, '.')) : null,
                                        pH: r[2].includes('pH') ? Number(r[5].replace(/,/g, '.')) : null,
                                        temperature: r[2].includes('TEMPERATURA') ? Number(r[5].replace(/,/g, '.')) : null,
                                        salinity: r[2].includes('SALINITA') ? Number(r[5].replace(/,/g, '.')) : null,
                                        dissolvedOxygen: r[2].includes('OSSIGENO') ? Number(r[5].replace(/,/g, '.')) : null,
                                        escherichiaColi: r[2].includes('ESCHERICHIA') ? Number(r[5].replace(/,/g, '.')) : null,
                                        userId: 'importer',
                                        placeDescription: placeDescription,
                                        datetime: date,
                                        latitude: r[10],
                                        longitude: r[11]
                                    }
                                    locationsAround[0].measures.push(measure)
                                    console.log('Added measure to existing location')
                                }

                            }
                        }
                    });

                    const locationsJSON = JSON.stringify({ locations: { documents: locations } });

                    download(locationsJSON, 'exportedLazio.json', 'text/plain');
                }
            });
        }


        reader.readAsText(file);
    }


    return <FileUploader handleFile={handleReadRemoteFile} text='Start' />
}
