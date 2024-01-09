const TDS_levels = [
    {
        min: 0,
        max: 9,
        level: 5,
        description: 'Pure water'
    },
    {
        min: 10,
        max: 60,
        level: 4,
        description: 'Mountain spring'
    },
    {
        min: 61,
        max: 100,
        level: 3,
        description: 'Purified'
    },
    {
        min: 101,
        max: 300,
        level: 2,
        description: 'Tap'
    },
    {
        min: 300,
        max: 9999,
        level: 1,
        description: 'Super polluted'
    }
]


function calculateWQI(measure) {

    let wqi = 0;
    let wqiText = 'Not available';
    if (measure?.totalDissolvedSolids) {
        TDS_levels.forEach(element => {
            if (measure.totalDissolvedSolids >= element.min && measure.totalDissolvedSolids <= element.max) {                
                wqi = element.level;
                wqiText = element.description;
            }
        });
    }
    return [wqi, wqiText];
}

function getMarkerColor(measure) {
    const [wqi, wqiText] = calculateWQI(measure);
    //console.log('Calculated WQI: ' + wqi)
    switch (wqi) {
        case 0:
            return 'markerGray.png';

        case 1:
            return 'markerBrown.png';

        case 2:
            return 'markerRed.png';

        case 3:
            return 'markerYellow.png';

        case 4:
            return 'markerGreen.png'

        case 5:
            return 'markerBlue.png';

        default:
            return 'markerGray.png'

    }
}

export {
    calculateWQI,
    getMarkerColor
}