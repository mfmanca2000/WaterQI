import React from 'react'
import { Link } from 'react-router-dom'

function HomeMenuItem({ menuItem }) {
    return (
        <Link to={menuItem.path}>
            <div className='w-full bg-gray-100 rounded-xl p-4'>
                <div className='p-4'>
                    <img src={menuItem.image} alt={menuItem.title} className='rounded-xl object-fill' />
                </div>
                <div className=' text-left'>
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