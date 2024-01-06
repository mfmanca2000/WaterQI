import React, { useState } from 'react';
import {
    AdvancedMarker,
    InfoWindow,
    useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';
import { formatDateTime } from '../utils/date';

const MarkerWithInfowindow = ({ measure }) => {

    const [infowindowOpen, setInfowindowOpen] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();

    return (
        <>
            <AdvancedMarker
                ref={markerRef}
                onClick={() => setInfowindowOpen(true)}
                position={{ lat: measure.latitude, lng: measure.longitude }}
                title={'AdvancedMarker that opens an Infowindow when clicked.'}
            />
            {infowindowOpen && (
                <InfoWindow
                    anchor={marker}
                    maxWidth={200}
                    onCloseClick={() => setInfowindowOpen(false)}>
                    {formatDateTime(new Date(measure.datetime))}{' '}<br />
                    <b style={{ whiteSpace: 'nowrap' }}> {measure.placeDescription} </b><br />
                    EC: {measure.electricalConductivity ? measure.electricalConductivity : '-'}<br />
                    TDS: {measure.totalDissolvedSolids ? measure.totalDissolvedSolids : '-'}<br />
                    pH: {measure.pH ? measure.pH : '-'}<br />
                    Temperature (°C): {measure.temperature ? measure.temperature : '-'}<br />
                    Salinity: {measure.salinity ? measure.salinity : '-'}<br />
                </InfoWindow>
            )}
        </>
    );
};

export default MarkerWithInfowindow