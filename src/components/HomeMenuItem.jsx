import React from 'react'
import { Link } from 'react-router-dom'

function HomeMenuItem({ menuItem }) {
    return (
        <Link to={menuItem.path}>
            <div className='w-full bg-gray-100 rounded-xl p-4'>
                <div className='flex w-full justify-center my-4'>
                    <img src={menuItem.image} alt={menuItem.title} className='rounded-xl object-cover object-center h-36' />
                </div>
                <div className='flex items-center justify-center text-center my-2 h-16 align-middle'>
                    <label className='text-xl font-bold'>{menuItem.title}</label>
                </div>
                <div className=''>
                    <label className='text-base font-light'>{menuItem.description}</label>
                </div>
            </div>
        </Link>
    )
}

export default HomeMenuItem