import React, { useEffect, useState } from 'react'
import databaseService from '../appwrite/database.js'
import { usePapaParse } from 'react-papaparse'
import { Button } from 'flowbite-react';

/*
0: data;
1: Comune;
2: Lon;
3: Lat
4: Conducibilità; P00036
5: PH; P00039
6: Solidi sospesi; P00041
7: Temperatura; P00042
*/


const filename = 'Piemonte.csv'



export default function ExtractPiemonteDataSet() {
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


    function parseDate(s) {
        var months = {
            gen: 0, feb: 1, mar: 2, apr: 3, mag: 4, giu: 5,
            lug: 6, ago: 7, set: 8, ott: 9, nov: 10, dic: 11
        };
        var p = s.substring(0,9).split('-');
        return new Date('20'+p[2], months[p[1].toLowerCase()], p[0]);
    }


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



                        if (isNaN(r[2]) || isNaN(r[3])) return;
                        
                        var date = parseDate(r[0])
                        console.log(date)

                        const locationsAround = databaseService.getAllLocationsAroundFromList(locations, Number(r[3]), Number(r[2]), 100);
                        if (locationsAround.length === 0) {

                            const measure = { $id: null, electricatConductivity: r[4] != '' ? Number(r[4]) : null, pH: r[5] != '' ? Number(r[5]) : null, totalDissolvedSolids: r[6] != '' ? Number(r[6]) : null, temperature: r[7] != '' ? Number(r[7]) : null, userId: 'importer', placeDescription: r[1], datetime: date, latitude: Number(r[3]), longitude: Number(r[2]) }
                            const loc = { $id: null, userId: 'importer', username: null, name: r[1], latitude: Number(r[3]), longitude: Number(r[2]), imageId: null, measures: [measure] }
                            locations.push(loc)
                            console.log('Added new location')

                        } else {

                            const measure = { $id: null, electricatConductivity: r[4] != '' ? Number(r[4]) : null, pH: r[5] != '' ? Number(r[5]) : null, totalDissolvedSolids: r[6] != '' ? Number(r[6]) : null, temperature: r[7] != '' ? Number(r[7]) : null, userId: 'importer', placeDescription: r[1], datetime: date, latitude: Number(r[3]), longitude: Number(r[2]) }
                            locationsAround[0].measures.push(measure)
                            console.log('Added measure to existing location')

                        }
                    }
                });


                const locationsJSON = JSON.stringify({ locations: { documents: locations } });

                download(locationsJSON, 'exportedPiemonte.json', 'text/plain');
            }
        })
    }


    return <Button className='rounded bg-red-500 h-12 mt-2' onClick={() => handleReadRemoteFile()}>Start</Button>;
}