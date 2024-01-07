import React from 'react'
import { Link } from 'react-router-dom'

function HomeMenuItem({ menuItem }) {
    return (
        <Link to={menuItem.path}>
            <div className='w-full bg-gray-100 rounded-xl p-4 h-96'>
                <div className='justify-center mb-4 h-1/3'>
                    <img src={menuItem.image} alt={menuItem.title} className='rounded-xl w-1/2' />
                </div>
                <div className='h-1/3'>
                    <label className='text-xl font-bold'>{menuItem.title}</label>
                </div>
                <div className='h-1/3'>
                    <label className='text-sm font-light'>{menuItem.description}</label>
                </div>
            </div>
        </Link>
    )
}

export default HomeMenuItem