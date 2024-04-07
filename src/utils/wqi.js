import { Icon } from "leaflet";

const TDS_levels = [
    {
        min: 0,
        max: 9,
        level: 5,
        description: 'tdsLevel0'
    },
    {
        min: 10,
        max: 60,
        level: 4,
        description: 'tdsLevel1'
    },
    {
        min: 61,
        max: 100,
        level: 3,
        description: 'tdsLevel2'
    },
    {
        min: 101,
        max: 300,
        level: 2,
        description: 'tdsLevel3'
    },
    {
        min: 300,
        max: 9999,
        level: 1,
        description: 'tdsLevel4'
    }
]

//L'indice LIMECO va da 0 a 1. Valori bassi hanno "livello 5", valori alti hanno "livello 1" 
const LIMECO_LEVELS = [
    {
        min: 0,
        max: 0.17,
        level: 5,
        description: 'limecoLevel5'
    },
    {
        min: 0.17,
        max: 0.33,
        level: 4,
        description: 'limecoLevel4'
    },
    {
        min: 0.33,
        max: 0.50,
        level: 3,
        description: 'limecoLevel3'
    },
    {
        min: 0.50,
        max: 0.66,
        level: 2,
        description: 'limecoLevel2'
    },
    {
        min: 0.66,
        max: 1,
        level: 1,
        description: 'limecoLevel1'
    }
]


function calculateWQIMeasureGroup(measureGroup) {
    if (!measureGroup) return [0, 'notAvailable'];

    let lastMeasure = null;

    if (measureGroup.measures && measureGroup.measures.length > 0) {
        lastMeasure = measureGroup?.measures.sort(function (a, b) {
            return new Date(b.datetime) - new Date(a.datetime);
        })[0];

        return calculateWQI(lastMeasure);
    }

    return [0, 'notAvailable']
}


function calculateWQILocation(location) {
    if (!location) return [0, 'notAvailable'];

    let lastMeasure = null;

    if (location.measures && location.measures.length > 0) {
        lastMeasure = location?.measures.sort(function (a, b) {
            return new Date(b.datetime) - new Date(a.datetime);
        })[0];

        return calculateWQI(lastMeasure);
    }

    return [0, 'notAvailable']
}

function cleanData(data) {
    if (data.electricalConductivity === '') data.electricalConductivity = null
    if (data.totalDissolvedSolids === '') data.totalDissolvedSolids = null
    if (data.pH === '') data.pH = null
    if (data.temperature === '') data.temperature = null
    if (data.salinity === '') data.salinity = null
}

function calculateWQI(measure) {

    let wqi = 0;
    let wqiText = 'notAvailable';
    // if (measure?.totalDissolvedSolids) {
    //     TDS_levels.forEach(element => {
    //         if (measure.totalDissolvedSolids >= element.min && measure.totalDissolvedSolids <= element.max) {
    //             wqi = element.level;
    //             wqiText = element.description;
    //         }
    //     });
    // }

    if (measure?.limeco) {
        LIMECO_LEVELS.forEach(element => {
            if (measure.limeco >= element.min && measure.limeco < element.max) {
                wqi = element.level;
                wqiText = element.description;
            }
        })
    }

    return [wqi, wqiText];
}

function getMarkerIcon(measure) {
    return new Icon({
        iconUrl: window.location.origin + '/' + getMarkerColor(measure),
        iconSize: [42, 42] // size of the icon
    });
}

function getMarkerColor(measure) {
    const [wqi, _] = calculateWQI(measure);
    //console.log('Calculated WQI: ' + wqi)
    switch (wqi) {
        case 0:
            return 'markerGray.png';

        case 5:
            return 'markerBrown.png';

        case 4:
            return 'markerRed.png';

        case 3:
            return 'markerYellow.png';

        case 2:
            return 'markerGreen.png'

        case 1:
            return 'markerBlue.png';

        default:
            return 'markerGray.png'

    }
}

function getMarkerColorMeasureGroup(measureGroup) {
    if (!measureGroup) return null;

    let lastMeasure = null;

    if (measureGroup.measures && measureGroup.measures.length > 0) {
        lastMeasure = measureGroup?.measures.sort(function (a, b) {
            return new Date(b.datetime) - new Date(a.datetime);
        })[0];

        const [wqi, _] = calculateWQI(lastMeasure);
        //console.log('Calculated WQI: ' + wqi)
        switch (wqi) {
            case 0:
                return 'multiplemarkerGray.png';

            case 5:
                return 'multiplemarkerBrown.png';

            case 4:
                return 'multiplemarkerRed.png';

            case 3:
                return 'multiplemarkerYellow.png';

            case 2:
                return 'multiplemarkerGreen.png'

            case 1:
                return 'multiplemarkerBlue.png';

            default:
                return 'multiplemarkerGray.png'

        }

    }

}

function getLocationIcon(location) {
    if (location) {

        return new Icon({            
            iconUrl: window.location.origin + '/' + getMarkerColorLocation(location),
            iconSize: [36, 36] // size of the icon
        });
    } else {
        return new Icon({            
            iconUrl: window.location.origin + '/markerGray.png',
            iconSize: [36, 36] // size of the icon
        });
    }
}


function getMarkerColorLocation(location) {
    if (!location) return null;

    let lastMeasure = null;

    if (location.measures && location.measures.length > 0) {
        lastMeasure = location.measures.sort(function (a, b) {
            return new Date(b.datetime) - new Date(a.datetime);
        })[0];

        const [wqi, _] = calculateWQI(lastMeasure);
        //console.log('Calculated WQI: ' + wqi)
        switch (wqi) {
            case 0:
                return location.userId == 'importer' ? 'multiplemarkerGray.png' : 'multiplemarkerGrayUser.png';

            case 5:
                return location.userId == 'importer' ? 'multiplemarkerBrown.png' : 'multiplemarkerBrownUser.png';

            case 4:
                return location.userId == 'importer' ? 'multiplemarkerRed.png' : 'multiplemarkerRedUser.png';

            case 3:
                return location.userId == 'importer' ? 'multiplemarkerYellow.png' : 'multiplemarkerYellowUser.png';

            case 2:
                return location.userId == 'importer' ? 'multiplemarkerGreen.png' : 'multiplemarkerGreenUser.png';

            case 1:
                return location.userId == 'importer' ? 'multiplemarkerBlue.png' : 'multiplemarkerBlueUser.png';

            default:
                return location.userId == 'importer' ? 'multiplemarkerGray.png' : 'multiplemarkerGrayUser.png';

        }
    } else {           
        return location.userId == 'importer' ? 'multiplemarker.png' : 'multiplemarkerUser.png'
    }
}




export {
    calculateWQI,
    calculateWQIMeasureGroup,
    calculateWQILocation,
    getMarkerIcon,
    getMarkerColor,
    getMarkerColorMeasureGroup,
    getLocationIcon,
    getMarkerColorLocation,
    cleanData
}