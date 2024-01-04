import React from 'react'
import Container from './Container.jsx'
import Logo from './Logo.jsx'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LogoutBtn from './LogoutBtn.jsx'

function Header() {
    const loggedIn = useSelector((state) => state.auth.loggedIn);
    const navigate = useNavigate();
    const navItems = [
        {
            name: "Home",
            slug: "/",
            active: true
        },
        {
            name: "Login",
            slug: "/login",
            active: !loggedIn
        },
        {
            name: "Signup",
            slug: "/signup",
            active: !loggedIn
        },
        {
            name: "Measures",
            slug: "/measures",
            active: loggedIn
        },
        {
            name: "AddMeasure",
            slug: "/addMeasure",
            active: loggedIn
        }
    ]
  return (
    <header className='py-3 shadow bg-casaleggio-rgba'>
        <Container>
            <nav className='flex'>
                <div className='mr-4'>
                    <Link to="/">
                        <Logo width='100%'/>
                    </Link>
                </div>
                <ul className='flex ml-auto'>
                    {
                        navItems.map((item) => item.active ? (
                           <li key={item.name}>
                            <button onClick={() => navigate(item.slug)} className='inline-block px-6 py-2 duration-200 hover:bg-casaleggio-btn-rgba rounded-full'>
                                {item.name}
                            </button>
                           </li> 
                        ) : null)
                    }
                    {loggedIn && (<li>
                        <LogoutBtn/>
                    </li>) }
                </ul>
            </nav>
        </Container>
    </header>
  )
}

export default Header