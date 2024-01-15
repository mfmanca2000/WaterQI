import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Avatar, Dropdown, DropdownItem, Navbar } from 'flowbite-react';
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
        {
            name: `${t('headerAddReport')}`,
            slug: "/addReport",
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
                navigate('/login');
            } else {
                navigate('/');
            }
        });

    }

    return (
        <header className='py-2 shadow bg-casaleggio-rgba'>

            <Navbar fluid rounded className='bg-transparent mx-8'>
                <Navbar.Brand className='' href="/">
                    <div className='sm:w-48 sm:flex'>
                        <img src="/Logo.png" className="mr-3 h-8 sm:h-14" alt="WaterQI Logo" />
                        <span className="w-full self-center whitespace-nowrap text-3xl font-semibold dark:text-white">WaterQI</span>
                    </div>
                </Navbar.Brand>


                <div className='flex lg:order-2'>
                    {loggedIn ? (
                        <Dropdown arrowIcon={true} size="lg" inline label={<Avatar alt="Your avatar" rounded bordered status={userData.labels.includes('admin') ? "online" : ''} statusPosition="top-right" placeholderInitials={Array.from(userData?.name)[0]} />}>
                            <Dropdown.Header>
                                <div className='flex text-base' >
                                    <label className=''>{userData.name}</label>
                                    <label className='ml-2 italic'>({userData.prefs.username})</label>
                                </div>

                                {userData.labels.includes('admin') && (
                                    <label className='text-casaleggio-rgba'>Admin</label>
                                )}

                                <span className="block truncate text-base font-medium">{userData.email}</span>
                            </Dropdown.Header>

                            <Dropdown.Item href='/profile'>{t('headerProfile')}</Dropdown.Item>
                            <Dropdown.Item href='/settings'>{t('headerSettings')}</Dropdown.Item>
                            <Dropdown.Item href='/help'>{t('headerHelp')}</Dropdown.Item>

                            <div className='m-3 mt-1'>
                                <LanguageSelector />
                            </div>

                            <Dropdown.Divider />
                            <Dropdown.Item onClick={logoutHandler}>
                                {t('logout')}
                            </Dropdown.Item>

                        </Dropdown>) : null}
                    <Navbar.Toggle className='mx-2' />
                </div>

                <Navbar.Collapse className=''>
                    {
                        navItems.map((item) => item.active ? (
                            <Navbar.Link className='text-lg' key={item.name} href={item.slug}>
                                {item.name}
                            </Navbar.Link>
                        ) : null)
                    }
                </Navbar.Collapse>

            </Navbar>
        </header>
    )
}

export default Header