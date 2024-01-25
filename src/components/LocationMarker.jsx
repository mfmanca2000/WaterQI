import React, { useState } from 'react';
import { Marker, InfoWindow, useAdvancedMarkerRef, AdvancedMarker } from '@vis.gl/react-google-maps';
import { Link } from 'react-router-dom';
import { calculateWQIMeasureGroup, getMarkerColorLocation } from '../utils/wqi';
import { useTranslation } from 'react-i18next';
import { Card } from 'flowbite-react';
import { IoBeaker } from 'react-icons/io5';
import MeasureChart from './MeasureChart';

function LocationMarker({ location }) {
    const [infowindowOpen, setInfowindowOpen] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();
    const { t } = useTranslation();

    const [wqi, wqiText] = calculateWQIMeasureGroup(location);

    return (
        <>
            <AdvancedMarker color="blue"
                ref={markerRef}
                onClick={() => setInfowindowOpen(!infowindowOpen)}
                position={{ lat: location.latitude, lng: location.longitude }}
                title={location.name}>
                <img src={window.location.origin + '/' + getMarkerColorLocation(location)} className="w-9" title={t(wqiText)} />
            </AdvancedMarker>

            {infowindowOpen && (
                <InfoWindow
                    anchor={marker}
                    maxWidth={300} minWidth={300}
                    onCloseClick={() => setInfowindowOpen(false)}>

                    {/* <Card className='flex flex-wrap hover:bg-casaleggio-btn-rgba ' href={`/location/${location.$id}`}>
                            <div className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white text-center">
                                {location.name}
                            </div>
                            <div className='flex justify-center gap-2 align-middle'>
                                <IoBeaker className='w-5 h-5'/>
                                <p className="text-lg text-gray-700 dark:text-gray-400 text-casaleggio-rgba">
                                    {location.measures.length}
                                </p>
                            </div>
                        </Card> */}

                    <div className='w-full bg-casaleggio-rgba p-2 text-xl font-bold'>
                        <Link className='underline font-bold' to={`/location/${location.$id}`}>{location.name}</Link> 
                    </div>
                    <div className='w-full text-md text-right font-bold'>
                        {location.measures.length + ' ' + ((location.measures.length == 0 || location.measures.length > 1) ? t('measuresLabel') : t('measureLabel'))}
                    </div>
                    <div>
                        <MeasureChart height={200} values={location.measures.sort(function (a, b) {
                            return new Date(a.datetime) - new Date(b.datetime);
                        })} />
                    </div>



                </InfoWindow>
            )}
        </>
    );
}

export default LocationMarker