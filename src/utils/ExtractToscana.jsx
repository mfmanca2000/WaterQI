import React, { useEffect, useState } from 'react'
import databaseService from '../appwrite/database.js'
import { readString, usePapaParse } from 'react-papaparse'
import { Button } from 'flowbite-react';
import proj4 from 'proj4';
import FileUploader from '../components/FileUploader.jsx';

/*
0: Provincia;
1: Comune;
2: Stazione
3: Data;
4: Parametro;
5: Valore;
6: x;
7: y;
*/


const filename = 'Toscana.csv'



export default function ExtractToscanaDataSet() {
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

    function parseDate(s) {
        var months = {
            gen: 0, feb: 1, mar: 2, apr: 3, mag: 4, giu: 5,
            lug: 6, ago: 7, set: 8, ott: 9, nov: 10, dic: 11
        };
        var p = s.split('-');
        return new Date(p[2], months[p[1].toLowerCase()], p[0]);
    }


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

                            let long_lat = proj4(GAUSS_BOAGA, WGS84, [Number(r[6]), Number(r[7])])
                            let placeDescription = r[2] + ' - ' + r[1] + ' (' + r[0] + ')'

                            // var dateParts = r[3].split(".");
                            // var date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

                            var date = parseDate(r[3])


                            //console.log(placeDescription)
                            //console.log(long_lat[1] + ' - ' + long_lat[0])
                            //console.log(date)

                            const locationsAround = databaseService.getAllLocationsAroundFromList(locations, long_lat[1], long_lat[0], 100);
                            if (locationsAround.length === 0) {

                                const measure = {
                                    $id: null,
                                    electricatConductivity: r[4]?.includes('CONDUCIBILITA') ? Number(r[5]) : null,
                                    pH: r[4].includes('PH') ? Number(r[5].replace(/,/g, '.')) : null,
                                    totalDissolvedSolids: r[4].includes('SOLIDI') ? Number(r[5].replace(/,/g, '.')) : null,
                                    temperature: r[4].includes('TEMPERATURA') ? Number(r[5].replace(/,/g, '.')) : null,
                                    phosphates: r[4].includes('FOSFATI') ? Number(r[5].replace(/,/g, '.')) : null,
                                    dissolvedOxygen: r[4].includes('OSSIGENO') ? Number(r[5].replace(/,/g, '.')) : null,
                                    userId: 'importer',
                                    placeDescription: placeDescription,
                                    datetime: date,
                                    latitude: long_lat[1],
                                    longitude: long_lat[0]
                                }
                                const loc = { $id: null, userId: 'importer', username: null, name: r[1] + ' (' + r[0] + ')', latitude: long_lat[1], longitude: long_lat[0], imageId: null, measures: [measure] }
                                locations.push(loc)
                                console.log('Added new location')

                            } else {

                                const measureInDate = locationsAround[0].measures.filter((m) => {
                                    console.log('Existing: ' + m.datetime)
                                    console.log('This line: ' + date)
                                    return m.datetime.getTime() === date.getTime()
                                })

                                if (measureInDate.length === 1) {
                                    if (r[4]?.includes('CONDUCIBILITA')) {
                                        measureInDate[0].electricatConductivity = Number(r[5].replace(/,/g, '.'))
                                    }
                                    if (r[4].includes('PH')) {
                                        measureInDate[0].pH = Number(r[5].replace(/,/g, '.'))
                                    }
                                    if (r[4].includes('SOLIDI')) {
                                        measureInDate[0].totalDissolvedSolids = Number(r[5].replace(/,/g, '.'))
                                    }
                                    if (r[4].includes('TEMPERATURA')) {
                                        measureInDate[0].temperature = Number(r[5].replace(/,/g, '.'))
                                    }
                                    if (r[4].includes('FOSFATI')) {
                                        measureInDate[0].phosphates = Number(r[5].replace(/,/g, '.'))
                                    }
                                    if (r[4].includes('OSSIGENO')) {
                                        measureInDate[0].dissolvedOxygen = Number(r[5].replace(/,/g, '.'))
                                    }


                                    console.log('Corrected existing measure')

                                } else {
                                    const measure = {
                                        $id: null,
                                        electricatConductivity: r[4]?.includes('CONDUCIBILITA') ? Number(r[5].replace(/,/g, '.')) : null,
                                        pH: r[4].includes('pH') ? Number(r[5].replace(/,/g, '.')) : null,
                                        totalDissolvedSolids: r[4].includes('SOLIDI') ? Number(r[5].replace(/,/g, '.')) : null,
                                        temperature: r[4].includes('TEMPERATURA') ? Number(r[5].replace(/,/g, '.')) : null,
                                        phosphates: r[4].includes('FOSFATI') ? Number(r[5].replace(/,/g, '.')) : null,
                                        dissolvedOxygen: r[4].includes('OSSIGENO') ? Number(r[5].replace(/,/g, '.')) : null,
                                        userId: 'importer',
                                        placeDescription: placeDescription,
                                        datetime: date,
                                        latitude: long_lat[1],
                                        longitude: long_lat[0]
                                    }
                                    locationsAround[0].measures.push(measure)
                                    console.log('Added measure to existing location')
                                }

                            }
                        }
                    });

                    const locationsJSON = JSON.stringify({ locations: { documents: locations } });

                    download(locationsJSON, 'exportedToscana.json', 'text/plain');
                }
            });
        }


        reader.readAsText(file);
    };

    //return <Button className='rounded bg-red-500 h-12 mt-2' onClick={() => handleReadRemoteFile()}>Start</Button>;
    return <FileUploader handleFile={handleReadRemoteFile} text='Start' />
}