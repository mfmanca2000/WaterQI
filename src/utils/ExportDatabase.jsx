import { Button } from 'flowbite-react'
import React from 'react'
import databaseService from '../appwrite/database';

function ExportDatabase() {

    const handleBackup = async () => {

        const locations = await databaseService.getAllLocations(null, null, 1000000, true)
        console.log('Found ' + locations.documents.length + ' locations')        
        const measures = await databaseService.getAllMeasures()
        console.log('Found ' + measures.documents.length + ' measures')
        const reports = await databaseService.getAllReports(null, null, 1000000)
        console.log('Found ' + reports.documents.length + ' reports')

        const allData = { locations: locations, measures: measures, reports: reports }
        const allDataJson = JSON.stringify(allData);
        console.log(allDataJson);
        
        download(allDataJson, 'backup'+ new Date().toISOString().substring(0,10) + '.json', 'text/plain');
    }


    function download(content, fileName, contentType) {
        var a = document.createElement("a");
        var file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
    


    return (
        <Button className='rounded bg-casaleggio-rgba h-12 mt-2' onClick={async () => await handleBackup()}>Start</Button>
    )
}

export default ExportDatabase