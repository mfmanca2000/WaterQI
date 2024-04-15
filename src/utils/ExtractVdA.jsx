import React, { useEffect, useState } from 'react'
import databaseService from '../appwrite/database.js'
import { usePapaParse } from 'react-papaparse'
import FileUploader from '../components/FileUploader.jsx';
import proj4 from 'proj4';

/*
0: data;
3: Comune;
5: Corpo idrico
6: Lon ED-50;
7: Lat ED-50;
8: Limeco; 
10: PH; 
11: Solidi sospesi; 
12: Conducibilità;
18: Fosfati;
20: Escherichia Coli; 
21: Ossigeno Disciolto;
*/



function ExtractVdADataSet() {
    const [results, setResults] = useState([])
    const { readRemoteFile, readString } = usePapaParse();

    const ED50 = "+proj=utm +zone=32 +ellps=intl +towgs84=-87,-96,-120,0,0,0,0 +units=m +no_defs +type=crs";                  
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
                        if (counter == 1 || counter == 2) return; // skip first and second line with headers and measure units
                        else {

                            console.log('Locations inserted so far: ' + locations.length)


                            if (isNaN(r[6]) || isNaN(r[7])) return;

                            var long_lat = proj4(ED50, WGS84, [Number(r[6]), Number(r[7])])

                            var dateParts = r[0].split("/");
                            var date = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

                            const locationsAround = databaseService.getAllLocationsAroundFromList(locations, long_lat[1], long_lat[0], 100);
                            const measure = {
                                $id: null,

                                limeco: r[8] != '' ? Number(r[8].replace(/,/g, '.')) : null,
                                pH: r[10] != '' ? Number(r[10].replace(/,/g, '.')) : null,
                                totalDissolvedSolids: r[11] != '' ? Number(r[11].replace(/,/g, '.')) : null,
                                electricalConductivity: r[12] != '' ? Number(r[12].replace(/,/g, '.')) : null,
                                temperature: null,
                                phosphates: r[18] != '' ? Number(r[18].replace(/,/g, '.')) : null,
                                escherichiaColi: r[20] != '' ? Number(r[20].replace(/,/g, '.')) : null,
                                dissolvedOxygen: r[21] != '' ? Number(r[21].replace(/,/g, '.')) : null,
                                userId: 'importer',
                                placeDescription: r[3] + ' - ' + r[5],
                                datetime: date,
                                latitude: long_lat[1],
                                longitude: long_lat[0]
                            }

                            if (locationsAround.length === 0) {
                                const loc = { $id: null, userId: 'importer', username: null, name: r[3] + ' - ' + r[5], latitude: long_lat[1], longitude: long_lat[0], imageId: null, measures: [measure] }
                                locations.push(loc)
                                console.log('Added new location')

                            } else {

                                locationsAround[0].measures.push(measure)
                                console.log('Added measure to existing location')
                            }
                        }
                    });


                    const locationsJSON = JSON.stringify({ locations: { documents: locations } });

                    download(locationsJSON, 'exportedVdA.json', 'text/plain');
                }
            })

        };

        reader.readAsText(file);


    }

    return <FileUploader handleFile={handleReadRemoteFile} text='Start' />
}

export default ExtractVdADataSet