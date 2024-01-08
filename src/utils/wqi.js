const cleanWQIThreshold = 5

function calculateWQI(measure) {
    return -1;
}

function getMarkerColor(measure) {
    const wqi = calculateWQI(measure);

    if (wqi == -1) {
        return 'markerGray.png';
    } else {
        return wqi > cleanWQIThreshold ? 'markerBlue.png' : 'markerBrown.png';
    }
}

export {
    calculateWQI,
    cleanWQIThreshold,
    getMarkerColor
}