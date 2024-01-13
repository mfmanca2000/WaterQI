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
              navigate('/login');
            } else {              
              navigate('/');
            } 
        });

    }

  return (
    <button className='inline-block px-2 py-2 duration-200 hover:bg-casaleggio-rgba rounded-md' onClick={logoutHandler}>Logout</button>
  )
}

export default LogoutBtn