import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Avatar, Dropdown, Navbar } from 'flowbite-react';
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { LanguageSelector } from './LanguageSelector.jsx'
import authService from '../appwrite/auth.js'
import { logout } from '../store/authSlice'


function Header() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const loggedIn = useSelector((state) => state.auth.loggedIn);
    const navigate = useNavigate();
    const location = useLocation();
    const navItems = [
        {
            name: `${t('headerHome')}`,
            slug: "/",
            active: true
        },
        {
            name: `${t('login')}`,
            slug: "/login",
            active: !loggedIn
        },
        {
            name: `${t('headerSignup')}`,
            slug: "/signup",
            active: !loggedIn
        },
        {
            name: `${t('headerAllMeasures')}`,
            slug: "/measures",
            active: loggedIn
        },
        {
            name: `${t('headerAddMeasureGroup')}`,
            slug: "/addMeasureGroup",
            active: loggedIn
        },
        {
            name: `${t('headerAddMeasure')}`,
            slug: "/addMeasure",
            active: loggedIn
        },
    ]

    // const lngs = {
    //     it: { nativeName: 'Italiano' },
    //     en: { nativeName: 'English' },
    //     fr: { nativeName: 'Français' },
    // };

    const userData = useSelector((state) => state.auth.userData)

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
        <header className='py-2 shadow bg-casaleggio-rgba'>

            <Navbar rounded className='bg-transparent mx-16'>
                <Navbar.Brand href="/">
                    <img src="/Logo.png" className="mr-3 h-20 sm:h-9" alt="WaterQI Logo" />
                    <span className="self-center whitespace-nowrap text-3xl font-semibold dark:text-white">WaterQI</span>
                </Navbar.Brand>

                <Navbar.Collapse className='md:mt-4'>
                    {
                        navItems.map((item) => item.active ? (
                            <Navbar.Link className='text-lg' key={item.name} href={item.slug}>
                                {item.name}
                            </Navbar.Link>
                        ) : null)
                    }
                </Navbar.Collapse>

                <div className="flex md:order-2 mr-8 md:mt-4">
                    <div className='mr-6'>
                        <LanguageSelector />
                    </div>

                    {loggedIn ? (
                    <Dropdown arrowIcon={false} size="lg" inline label={<Avatar alt="Your avatar" rounded bordered placeholderInitials={Array.from(userData?.name)[0]} size="md"/>}>
                        <Dropdown.Header>
                            <span className="block text-base">{userData.name}</span>
                            <span className="block truncate text-base font-medium">{userData.email}</span>
                        </Dropdown.Header>

                        <Dropdown.Item href='/settings'>{t('headerSettings')}</Dropdown.Item>
                        <Dropdown.Item href='/help'>{t('headerHelp')}</Dropdown.Item>                    

                        <Dropdown.Divider />
                        <Dropdown.Item onClick={logoutHandler}>
                            {/* <LogoutBtn /> */}
                            {t('logout')}
                        </Dropdown.Item>
                    </Dropdown>
                    ) : null}

                    <Navbar.Toggle className='mx-2' />
                </div>


            </Navbar>
        </header>
    )
}

export default Header