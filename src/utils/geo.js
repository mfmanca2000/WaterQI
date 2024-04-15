function calcultateDistanceKM(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1Rad = toRad(lat1);
    var lat2Rad = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

function getMeasuresInRadius(measures, refLatitude, refLongitude, radiusMeters) {
    const earthRadius = 6371000; // meters


    const filteredPoints = measures.filter(m => {

        const dLat = toRad(m.latitude - refLatitude);
        const dLng = toRad(m.longitude - refLongitude);

        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(refLatitude)) *
            Math.cos(toRad(m.latitude)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceToPoint = earthRadius * c;

        return distanceToPoint <= radiusMeters;
    });

    return filteredPoints;
}


function getBoundingBoxCoordinates(refLatitude, refLongitude, distanceMeters) {
    const earthRadius = 6371000; // meters    
  
    // Convert distance to radians
    const distanceRadians = distanceMeters / earthRadius;
  
    // Calculate the minimum and maximum latitude
    const minLat = refLatitude - (distanceRadians * 180) / Math.PI;
    const maxLat = refLatitude + (distanceRadians * 180) / Math.PI;
  
    // Calculate the minimum and maximum longitude
    const minLng = refLongitude - (distanceRadians * 180) / (Math.PI * Math.cos((refLatitude * Math.PI) / 180));
    const maxLng = refLongitude + (distanceRadians * 180) / (Math.PI * Math.cos((refLatitude * Math.PI) / 180));
  
    // Return the bounding box coordinates
    return {
      minLatitude: minLat,
      maxLatitude: maxLat,
      minLongitude: minLng,
      maxLongitude: maxLng
    };
  }



// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}

// const testMeasures = [
//     // {
//     //     //Sant'Ampelio
//     //     latitude: 43.77587249915143,
//     //     longitude: 7.672825417856406
//     // },
//     {
//         name: 'Primi scogli 405',
//         latitude: 43.776836043183245,
//         longitude: 7.668001619113798
//     },

//     {
//         name: 'Secondi scogli 624m',
//         latitude: 43.77717593752238,
//         longitude: 7.66521849090914
//     },
//     {     
//         name: 'Terzi scogli 855m',
//         latitude: 43.77772980534006,
//         longitude: 7.6624791010308435
//     }
// ]

// const refLatitude = 43.77587249915143;
const refLongitude = 7.672825417856406;

//console.log('TEST');
//console.log(getMeasuresInRadius(testMeasures, refLatitude, refLongitude, 410));

export { calcultateDistanceKM, getMeasuresInRadius, getBoundingBoxCoordinates }