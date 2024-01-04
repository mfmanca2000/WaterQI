import React from 'react'
import { Link } from 'react-router-dom'
import StorageService from '../appwrite/storage.js'

function MeasureCard({$id, placeDescription, datetime, imageId}) {
  return (
    <Link to={`/measure/${$id}`}>
        <div className='w-full bg-gray-100 rounded-xl p-4'>
            <div className='w-ful justify-center mb-4'>
                <img src={StorageService.getPreviewImageUrl(imageId)} alt={placeDescription} className='rounded-xl'/>
            </div>
            <h3 className='text-xl font-bold'>{placeDescription}</h3>
            <h4 className='text-sm font-light'>{datetime}</h4>
        </div>
    </Link>
  )
}

export default MeasureCard