import React from 'react'
import { Link } from 'react-router-dom'

function HomeMenuItem({ menuItem }) {
    return (
        <Link to={menuItem.path} className="block h-full">
            <div className='w-full h-full bg-white border border-slate-200 rounded-card shadow-card hover:shadow-card-hover hover:border-brand-400 transition-all duration-200 p-6 flex flex-col cursor-pointer'>
                <div className='flex justify-center mb-4'>
                    {menuItem.icon ? (
                        <div className="w-16 h-16 flex items-center justify-center bg-brand-50 rounded-2xl text-brand-600 text-4xl">
                            {menuItem.icon}
                        </div>
                    ) : (
                        <div className='w-16 h-16 flex items-center justify-center bg-brand-50 rounded-2xl'>
                            <img src={menuItem.image} alt={menuItem.title} className='w-10 h-10 object-contain' />
                        </div>
                    )}
                </div>
                <div className='text-center mb-2'>
                    <span className='text-base font-semibold text-slate-900'>{menuItem.title}</span>
                </div>
                <div className='flex-1'>
                    <p className='text-sm text-slate-500 text-center leading-relaxed'>{menuItem.description}</p>
                </div>
                <div className='mt-4 pt-3 border-t border-slate-100 text-center text-sm text-brand-600 font-medium'>
                    →
                </div>
            </div>
        </Link>
    )
}

export default HomeMenuItem
