import React, { useEffect, useState } from 'react'
import databaseService from '../appwrite/database.js'
import { usePapaParse } from 'react-papaparse'
import { Button } from 'flowbite-react';

/*
0: Site Name;
1: Sample Date;
2: Sample Time;
3: Freshwater body type;
4: What is the main land use within 50m?;
5: Estimate the water flow;
6: Estimate the water level;
7: Nitrate (mg/L);
8: If Nitrate >10 mg/L, please enter result;
9: Phosphate (mg/L);
10: Ammonia;
11: Ammonium (mg/L);
12: Conductivity (æS cm-1) Europe;
13: pH;
14: Total dissolved solids (mg/L);
15: Water temperature (øC);
16: Water quality - Secchi Tube (Turbidity);
17: Estimate the water colour;
18: What are the atmospheric conditions?;
19: Odour;
20: x;
21: y

*/

//const filename = 'ExtractGlobalDataSet.csv'
const filename = 'GlobalDataSet.csv'



export default function SaveGlobalDataSet() {
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
          else if (( r[12] != null && r[12] != '') || (r[13 != 'None' && r[13] != null]) || (r[14] != '' && r[14] != null) || (r[15] != 'None' && r[15] != null)) {

            console.log('Locations inserted so far: ' + locations.length)

            const locationsAround = databaseService.getAllLocationsAroundFromList(locations, Number(r[21]), Number(r[20]), 100);
            if (locationsAround.length === 0) {

              // console.log('Adding: ' + r[0] + ' at ' + Number(r[21]) + ',' + Number(r[20]))

              const measure = { $id: null, electricalConductivity: r[12] != '' ? Number(r[12]) : null, pH: r[13] == 'None' ? null : Number(r[13]), totalDissolvedSolids: r[14] != '' ? Number(r[14]) : null, temperature: r[15] === 'None' ? null : Number(r[15]), userId: 'importer', placeDescription: r[0], datetime: new Date(r[1]), latitude: r[21], longitude: r[20] }
              const loc = { $id: null, userId: 'importer', username: null, name: r[0], latitude: parseFloat(r[21]), longitude: parseFloat(r[20]), imageId: null, measures: [measure] }

              locations.push(loc)

              console.log('Added new location')

            } else {
              const measure = { $id: null, electricalConductivity: r[12] != '' ? Number(r[12]) : null, pH: r[13] == 'None' ? null : Number(r[13]), totalDissolvedSolids: r[14] != '' ? Number(r[14]) : null, temperature: r[15] === 'None' ? null : Number(r[15]), userId: 'importer', placeDescription: r[0], datetime: new Date(r[1]), latitude: r[21], longitude: r[20] }
              locationsAround[0].measures.push(measure)

              console.log('Added measure to existing location')
            }
          }
        });

        const locationsJSON = JSON.stringify({ locations: { documents: locations } });

        download(locationsJSON, 'globalDataset.json', 'text/plain');
      }
    });
  };

  return <Button className='rounded bg-red-500 h-12 mt-2' onClick={() => handleReadRemoteFile()}>Start</Button>;
}