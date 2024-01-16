import databaseService from "../appwrite/database";
import storageService from "../appwrite/storage";

async function deleteMeasureGroup(measureGroup, deleteAllMeasures) {
    
    if (deleteAllMeasures){
        measureGroup.measures.forEach(m => {                
            databaseService.deleteMeasure(m.$id);                
        });
        console.log('All related measures deleted');

        //we are deleting everything so we can delete the image too
        storageService.deleteImage(measureGroup.imageId);   
        console.log('Deleted image');         
    }

    //If the group doesn't have any measure linked, we can delete the image too
    if (measureGroup.measures.length === 0){
        storageService.deleteImage(measureGroup.imageId);     
    }

    return await databaseService.deleteMeasureGroup(measureGroup.$id);
}


async function deleteMeasure(measure){
    //the measure is not part of a group, we need to delete its image from the storage
    if (!measure.measureGroup && measure.imageId){
        storageService.deleteImage(measure.imageId);
        console.log('Deleted image');
    }        

    return await databaseService.deleteMeasure(measure.$id)    
}


async function deleteReport(report){
    storageService.deleteImage(report.imageId);
    console.log('Deleted image');

    return await databaseService.deleteReport(report.$id);
}

export {
    deleteMeasureGroup,
    deleteMeasure,
    deleteReport
}