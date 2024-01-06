import React from 'react'
import { useDispatch } from 'react-redux'
import authService from '../appwrite/auth.js'
import { logout } from '../store/authSlice'
import { useNavigate, useLocation  } from 'react-router-dom'

function LogoutBtn() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const logoutHandler = () => {
        authService.logout().then(() => { 
            dispatch(logout());
            if (location.pathname === '/') {
              console.log('HERE');
              navigate('/login');
            } else {
              console.log('THERE')
              navigate('/');
            } 
        });

    }

  return (
    <button className='inline-block px-6 py-2 duration-200 hover:bg-blue-100 rounded-full' onClick={logoutHandler}>Logout</button>
  )
}

export default LogoutBtn