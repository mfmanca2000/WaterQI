import React, { useState } from 'react';
import { Marker, InfoWindow, useAdvancedMarkerRef, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Link } from 'react-router-dom';
import { calculateWQIMeasureGroup, getMarkerColorLocation } from '../utils/wqi';
import { useTranslation } from 'react-i18next';
import { Card } from 'flowbite-react';
import { IoBeaker } from 'react-icons/io5';

function LocationMarker({ location }) {
    const [infowindowOpen, setInfowindowOpen] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();
    const { t } = useTranslation();

    const [wqi, wqiText] = calculateWQIMeasureGroup(location);

    return (
        <>
            <AdvancedMarker color="blue"
                ref={markerRef}
                onClick={() => setInfowindowOpen(true)}
                position={{ lat: location.latitude, lng: location.longitude }}
                title={location.name}>
                <img src={window.location.origin + '/' + getMarkerColorLocation(location)} className="w-9" title={t(wqiText)} />
            </AdvancedMarker>

            {infowindowOpen && (
                <InfoWindow
                    anchor={marker}
                    maxWidth={300}
                    onCloseClick={() => setInfowindowOpen(false)}>
                    
                        <Card className='flex flex-wrap bg-casaleggio-rgba hover:bg-casaleggio-btn-rgba' href={`/location/${location.$id}`}>
                            <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-center">
                                {location.name}
                            </div>
                            <div className='flex justify-center gap-2 align-middle'>
                                <IoBeaker className='w-10 h-10  align-middle'/>
                                <p className="text-4xl text-gray-700 dark:text-gray-400 text-casaleggio-rgba">
                                    {location.measures.length}
                                </p>
                            </div>
                        </Card>

                </InfoWindow>
            )}
        </>
    );
}

export default LocationMarker