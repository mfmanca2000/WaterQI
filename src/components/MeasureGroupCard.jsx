import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from "react-redux"
import StorageService from '../appwrite/storage.js'

function MeasureGroupCard({ measureGroup, onDelete }) {
    const userData = useSelector((state) => state.auth.userData)

    const handleDelete = (e) => {
        onDelete(e, measureGroup.$id);
    }

    return (
        <>
            <div className='w-full bg-gray-400 rounded-xl p-4 h-80'>
                <Link to={`/measureGroup/${measureGroup.$id}`}>

                    <div className='w-full justify-center mb-4 h-36'>
                        <img src={StorageService.getPreviewImageUrl(measureGroup.imageId)} alt={measureGroup.description} className='rounded-xl h-36 object-fill w-full' />
                    </div>
                    <div className='min-h-14'>
                        <label className='text-xl font-bold'>{measureGroup.description}</label><br />
                    </div>
                    <div className='min-h-14 grid grid-cols-5'>
                        <label className='text-4xl font-bold col-span-4 text-right'>{measureGroup.measures.length}</label>
                        <div className=''>
                            <img src='multiplemarker.png' />
                        </div>
                    </div>
                </Link>
                {userData.$id === measureGroup.userId && (
                    <div className='text-left'>
                        <Link className='font-bold underline' onClick={handleDelete}>Delete</Link>
                    </div>
                )}
            </div>

        </>
    )
}

export default MeasureGroupCard