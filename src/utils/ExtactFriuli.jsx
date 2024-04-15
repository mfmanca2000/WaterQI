import React, { useEffect, useState } from 'react'
import databaseService from '../appwrite/database.js'
import { readString, usePapaParse } from 'react-papaparse'
import { Button } from 'flowbite-react';
import FileUploader from '../components/FileUploader.jsx';

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



export default function ExtractFriuliDataSet() {
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

                            const locationsAround = databaseService.getAllLocationsAroundFromList(locations, Number(r[5]), Number(r[6]), 100);
                            if (locationsAround.length === 0) {
                                
                                const measure = { 
                                    $id: null, 
                                    electricatConductivity: r[3]?.includes('Conduc') ? Number(r[4]) : null, 
                                    pH: r[3] === 'pH' ? Number(r[4]) : null, 
                                    totalDissolvedSolids: r[3] === 'Solidi sospesi totali' ? Number(r[4]) : null, 
                                    temperature: r[3] === 'Temperatura acqua' ? Number(r[4]) : null, 
                                    phosphates: r[3] ==='Fosfati' ? Number(r[4]) : null,
                                    userId: 'importer', 
                                    placeDescription: r[1] + ' (' + r[0] + ')', 
                                    datetime: new Date(r[2]), 
                                    latitude: r[5], 
                                    longitude: r[6] 
                                }
                                const loc = { $id: null, userId: 'importer', username: null, name: r[1] + ' (' + r[0] + ')', latitude: parseFloat(r[5]), longitude: parseFloat(r[6]), imageId: null, measures: [measure] }
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
                                        measureInDate[0].electricatConductivity = Number(r[4])
                                    }
                                    if (r[3] === 'pH') {
                                        measureInDate[0].pH = Number(r[4])
                                    }
                                    if (r[3] === 'Solidi sospesi totali') {
                                        measureInDate[0].totalDissolvedSolids = Number(r[4])
                                    }
                                    if (r[3] === 'Temperatura acqua') {
                                        measureInDate[0].temperature = Number(r[4])
                                    }
                                    if (r[3] === 'Fosfati') {
                                        measureInDate[0].phosphates = Number(r[4])
                                    }

                                    console.log('Corrected existing measure')

                                } else {
                                    const measure = { 
                                        $id: null, 
                                        electricatConductivity: r[3]?.includes('Conduc') ? Number(r[4]) : null, 
                                        pH: r[3] === 'pH' ? Number(r[4]) : null, 
                                        totalDissolvedSolids: r[3] === 'Solidi sospesi totali' ? Number(r[4]) : null, 
                                        temperature: r[3] === 'Temperatura acqua' ? Number(r[4]) : null, 
                                        phosphates: r[3] ==='Fosfati' ? Number(r[4]) : null,
                                        userId: 'importer', 
                                        placeDescription: r[1] + '(' + r[0] + ')', 
                                        datetime: new Date(r[2]), 
                                        latitude: r[5], 
                                        longitude: r[6] 
                                    }
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
        }

        reader.readAsText(file);
    };

    //return <Button className='rounded bg-red-500 h-12 mt-2' onClick={() => handleReadRemoteFile()}>Start</Button>;
    return <FileUploader handleFile={handleReadRemoteFile} text='Start' />
}