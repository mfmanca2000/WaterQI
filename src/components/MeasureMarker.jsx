import React, { useState } from 'react';
import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { formatDateTime } from '../utils/date';
import { Link } from 'react-router-dom';
import { calculateWQI, cleanWQIThreshold } from '../utils/wqi'

const MeasureMarker = ({ measure }) => {

    const [infowindowOpen, setInfowindowOpen] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();

    const wqi = calculateWQI(measure);

    return (
        <>
            <AdvancedMarker
                ref={markerRef}
                onClick={() => setInfowindowOpen(true)}
                position={{ lat: measure.latitude, lng: measure.longitude }}
                title={measure.placeDescription}>
                    <img src={ wqi > cleanWQIThreshold ? 'markerBlue.png' : (wqi >= 0 ? 'markerBrown.png' : 'markerGray.png')} className="w-10" />
            </AdvancedMarker>
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
                    Salinity: {measure.salinity ? measure.salinity : '-'}<br /><br/>
                    <Link className='font-bold underline' to={`/measure/${measure.$id}`}>Open</Link>
                </InfoWindow>
            )}
        </>
    );
};

export default MeasureMarker