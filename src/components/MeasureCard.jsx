import React from 'react'
import { Link } from 'react-router-dom'
import StorageService from '../appwrite/storage.js'
import { formatDateTime } from '../utils/date.js'
import { useSelector } from "react-redux";

function MeasureCard({ measure , onDelete }) {

  const handleDelete = (e) => {
    onDelete(e, measure.$id);
  }

  const userData = useSelector((state) => state.auth.userData) 
  
  return (
    <Link to={`/measure/${measure.$id}`}>
        <div className='w-full bg-gray-100 rounded-xl p-4'>
            <div className='w-ful justify-center mb-4'>
                <img src={StorageService.getPreviewImageUrl(measure.imageId)} alt={measure.placeDescription} className='rounded-xl'/>
            </div>
            <label className='text-xl font-bold'>{measure.placeDescription}</label><br/> 
            <label className='text-sm font-light'>{formatDateTime(new Date(measure.datetime))}</label><br/>            
            <label className='text-sm font-light'>By {measure.userId}</label> <br/>

            {userData.$id === measure.userId && (
              <Link className='font-bold underline' onClick={handleDelete}>Delete</Link>
            )}           
        </div>
    </Link>
  )
}

export default MeasureCard