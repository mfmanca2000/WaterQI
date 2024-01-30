import React from 'react'
import { useEffect } from 'react'
import { useMap, useMapEvent } from 'react-leaflet'

function MapController({canModify, setValue, setMarkerPosition, center, setCenterPosition, setIsManuallyDirty}) {
    const map = useMap()   
    
    useEffect(() => {
       map.setView([center.lat, center.lng]);
    }, [center, map])

    
    
    const onClick = (e) => {
        console.log('Here')
        if (canModify) {
            console.log(e);
            if (setValue) setValue("latitude", e.latlng.lat)
            if (setValue) setValue("longitude", e.latlng.lng);
            if (setMarkerPosition) setMarkerPosition({ lat: e.latlng.lat, lng: e.latlng.lng })
            if (setCenterPosition) setCenterPosition({ lat: e.latlng.lat, lng: e.latlng.lng })
            if (setIsManuallyDirty) setIsManuallyDirty(true)
        }
        map.setView(e.latlng)
    }    
         
    useMapEvent('click', onClick)
    

  return null;
}

export default MapController