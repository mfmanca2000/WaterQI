import React from 'react'
import { Link } from 'react-router-dom'

function HomeMenuItem({ menuItem }) {
    return (
        <Link to={menuItem.path}>
            <div className='w-full bg-gray-100 rounded-xl p-4'>
                <div className='p-4  justify-center'>
                    <img src={menuItem.image} alt={menuItem.title} className='rounded-xl object-cover object-center h-48' />
                </div>
                <div className=' text-left h-16'>
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