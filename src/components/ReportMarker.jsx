import { AdvancedMarker, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { InfoWindow } from './InfoWindow';
import { useState } from 'react'
import { Link } from 'react-router-dom';
import storageService from '../appwrite/storage';
import { formatDateTime } from '../utils/date';

function ReportMarker({ report }) {

    const [infowindowOpen, setInfowindowOpen] = useState(false);
    const [markerRef, marker] = useAdvancedMarkerRef();

    return (
        <>
            <AdvancedMarker
                ref={markerRef}
                onClick={() => setInfowindowOpen(!infowindowOpen)}
                position={{ lat: report?.latitude, lng: report?.longitude }}
                title={report?.title}>
                <img src='warning.png' className="w-10" title={report?.title} />
            </AdvancedMarker>
            {infowindowOpen && (
                <InfoWindow
                    anchor={marker}
                    maxWidth={450} minWidth={300}
                    onCloseClick={() => setInfowindowOpen(false)}>                    

                    <div className='w-full bg-casaleggio-rgba p-2 text-xl font-bold'>
                        <Link className='underline font-bold' to={`/report/${report.$id}`}>{report.title}</Link>
                    </div>
                    <div className='w-full text-md text-right font-bold '>
                        {formatDateTime(new Date(report.datetime))}
                    </div>
                    <div>
                        <p className='my-2 text-wrap text-justify' >{report.description}</p>
                    </div>
                    <div className='w-48 mx-auto'>
                        <img src={storageService.getPreviewImageUrl(report.imageId)} alt={report.title} className='rounded-lg w-48 object-fill' />
                    </div>


                </InfoWindow>
            )}
        </>
    )
}

export default ReportMarker