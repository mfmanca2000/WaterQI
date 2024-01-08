import React from 'react'
import { Link } from 'react-router-dom'
import StorageService from '../appwrite/storage.js'

function MeasureGroupCard({$id, description, measures, imageId}) {
    return (
        <Link to={`/measureGroup/${$id}`}>
            <div className='w-full bg-gray-400 rounded-xl p-4 h-80'>
                <div className='w-ful justify-center mb-4 h-36'>
                    <img src={StorageService.getPreviewImageUrl(imageId)} alt={description} className='rounded-xl h-36 object-fill w-full'/>
                </div>
                <h3 className='text-xl font-bold'>{description}</h3>
                <h4 className='text-sm font-light'># measures: {measures.length}</h4>            
            </div>
        </Link>
      )
}

export default MeasureGroupCard