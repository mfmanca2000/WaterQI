import React, { useState } from 'react';
import {
    Marker,
    InfoWindow,
    useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';
import { Link } from 'react-router-dom';

function MeasureGroupMarker({ measureGroup }) {
    const [infowindowOpen, setInfowindowOpen] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();

    return (
        <>
            <Marker
                ref={markerRef}
                onClick={() => setInfowindowOpen(true)}
                position={{ lat: measureGroup.latitude, lng: measureGroup.longitude }}
                title={measureGroup.description} 
                icon={"map-marker-multiple.svg"}/>                                
           
            {infowindowOpen && (
                <InfoWindow
                    anchor={marker}
                    maxWidth={200}                    
                    onCloseClick={() => setInfowindowOpen(false)}>

                    <b style={{ whiteSpace: 'nowrap' }}> {measureGroup.description} </b><br />
                    # measures: {measureGroup.measures.length}
                    <br /><br/>
                    <Link className='font-bold underline' to={`/measureGroup/${measureGroup.$id}`}>Open</Link>
                </InfoWindow>
            )}
        </>
    );
}

export default MeasureGroupMarker