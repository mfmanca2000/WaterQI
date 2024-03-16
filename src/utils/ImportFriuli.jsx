import React, { useEffect, useState } from 'react'
import databaseService from '../appwrite/database.js'
import { usePapaParse } from 'react-papaparse'
import { Button } from 'flowbite-react';

/*
0: Provincia;
1: Comune;
2: DataEN;
3: Parametro;
4: Unità di misura;
5: Risultato;
6: y;
7: x;
*/


const filename = 'FriuliVeneziaGiulia.csv'



export default function ImportFriuliDataSet() {
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
                    //at least one of the values is not null or empty
                    //else if (( r[12] != null && r[12] != '') || (r[13 != 'None' && r[13] != null]) || (r[14] != '' && r[14] != null) || (r[15] != 'None' && r[15] != null)) {
                    else {

                        console.log('Locations inserted so far: ' + locations.length)                        

                        const locationsAround = databaseService.getAllLocationsAroundFromList(locations, Number(r[6]), Number(r[7]), 100);
                        if (locationsAround.length === 0) {
                            
                            const measure = { $id: null, electricatConductivity: r[3]?.includes('Conduc') ? Number(r[5]) : null, pH: r[3] === 'pH' ? Number(r[5]) : null, totalDissolvedSolids: r[3] === 'Solidi sospesi totali' ? Number(r[5]) : null, temperature: r[3] === 'Temperatura acqua' ? Number(r[5]) : null, userId: 'importer', placeDescription: r[1] + '(' + r[0] + ')', datetime: new Date(r[2]), latitude: r[6], longitude: r[7] }
                            const loc = { $id: null, userId: 'importer', username: null, name: r[1] + '(' + r[0] + ')', latitude: parseFloat(r[6]), longitude: parseFloat(r[7]), imageId: null, measures: [measure] }
                            locations.push(loc)
                            console.log('Added new location')

                        } else {

                            const measureInDate = locationsAround[0].measures.filter((m) => { 
                                //console.log('Existing: ' + m.datetime)
                                //console.log('This line: ' + new Date(r[2]))
                                return m.datetime.getTime() === new Date(r[2]).getTime() 
                            })
                            
                            if (measureInDate.length === 1) {
                                if (r[3]?.includes('Conduc')) {
                                    measureInDate[0].electricatConductivity = Number(r[5])
                                }
                                if (r[3] === 'pH') {
                                    measureInDate[0].pH = Number(r[5])
                                }
                                if (r[3] === 'Solidi sospesi totali') {
                                    measureInDate[0].totalDissolvedSolids = Number(r[5])
                                }
                                if (r[3] === 'Temperatura acqua') {
                                    measureInDate[0].temperature = Number(r[5])
                                }

                                console.log('Corrected existing measure')

                            } else {
                                const measure = { $id: null, electricatConductivity: r[3]?.includes('Conduc') ? Number(r[5]) : null, pH: r[3] === 'pH' ? Number(r[5]) : null, totalDissolvedSolids: r[3] === 'Solidi sospesi totali' ? Number(r[5]) : null, temperature: r[3] === 'Temperatura acqua' ? Number(r[5]) : null, userId: 'importer', placeDescription: r[1] + '(' + r[0] + ')', datetime: new Date(r[2]), latitude: r[6], longitude: r[7] }
                                locationsAround[0].measures.push(measure)
                                console.log('Added measure to existing location')
                            }

                        }
                    }
                });

                const locationsJSON = JSON.stringify({ locations: { documents: locations } });

                download(locationsJSON, 'exportedFriuli.json', 'text/plain');
            }
        });
    };

    return <Button className='rounded bg-red-500 h-12 mt-2' onClick={() => handleReadRemoteFile()}>Start</Button>;
}