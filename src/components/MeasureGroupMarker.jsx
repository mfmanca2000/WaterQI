import React, { useState } from 'react';
import { Marker, InfoWindow, useAdvancedMarkerRef, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Link } from 'react-router-dom';
import { calculateWQIMeasureGroup, getMarkerColorMeasureGroup } from '../utils/wqi';
import { useTranslation } from 'react-i18next';

function MeasureGroupMarker({ measureGroup }) {
    const [infowindowOpen, setInfowindowOpen] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();
    const { t } = useTranslation();

    const [wqi, wqiText] = calculateWQIMeasureGroup(measureGroup);

    return (
        <>
            <AdvancedMarker color="blue"
                ref={markerRef}
                onClick={() => setInfowindowOpen(true)}
                position={{ lat: measureGroup.latitude, lng: measureGroup.longitude }}
                title={measureGroup.description}>
                <img src={window.location.origin + '/' + getMarkerColorMeasureGroup(measureGroup)} className="w-9" title={t(wqiText)} />
            </AdvancedMarker>

            {infowindowOpen && (
                <InfoWindow
                    anchor={marker}
                    maxWidth={200}
                    onCloseClick={() => setInfowindowOpen(false)}>

                    <b style={{ whiteSpace: 'nowrap' }}> {measureGroup.description} </b><br />
                    # measures: {measureGroup.measures.length}
                    <br /><br />
                    <Link className='font-bold underline' to={`/measureGroup/${measureGroup.$id}`}>Open</Link>
                </InfoWindow>
            )}
        </>
    );
}

export default MeasureGroupMarker