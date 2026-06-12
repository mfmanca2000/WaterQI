import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Avatar, Dropdown, Navbar } from 'flowbite-react';
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { LanguageSelector } from './LanguageSelector.jsx'
import authService from '../appwrite/auth.js'
import { logout } from '../store/authSlice'

function HeaderNew() {
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const loggedIn = useSelector((state) => state.auth.loggedIn);
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        { name: `${t('headerHome')}`,        slug: '/',           active: true },
        { name: `${t('login')}`,             slug: '/login',      active: !loggedIn },
        { name: `${t('headerSignup')}`,      slug: '/signup',     active: !loggedIn },
        { name: `${t('headerAllMeasures')}`, slug: '/locations',  active: loggedIn },
        { name: `${t('headerAddMeasure')}`,  slug: '/addMeasure', active: loggedIn },
        { name: `${t('headerAddReport')}`,   slug: '/addReport',  active: loggedIn },
    ]

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

    const isActive = (slug) => {
        if (slug === '/') return location.pathname === '/';
        return location.pathname.startsWith(slug);
    };

    return (
        <header className='sticky top-0 z-50 bg-brand-900 border-b border-brand-800 shadow-md'>

            <Navbar fluid className='bg-transparent max-w-7xl mx-auto px-4 lg:px-6 py-2'>
                <Navbar.Brand href="/">
                    <img src="/LogoFiumiPuliti.png" className="mr-3 h-9" alt="Fiumi Puliti Logo" />
                    <span className="self-center whitespace-nowrap text-lg font-semibold text-white hidden sm:block">
                        Fiumi Puliti
                    </span>
                </Navbar.Brand>

                <div className='flex items-center gap-2 lg:order-2'>
                    {loggedIn ? (
                        <Dropdown
                            arrowIcon={false}
                            inline
                            label={
                                <Avatar
                                    alt="Your avatar"
                                    rounded
                                    bordered
                                    status={userData.labels.includes('admin') ? 'online' : ''}
                                    statusPosition="top-right"
                                    placeholderInitials={Array.from(userData?.name)[0]}
                                    className="ring-2 ring-brand-400"
                                />
                            }
                        >
                            <Dropdown.Header>
                                <div className='flex items-baseline gap-1 text-sm'>
                                    <span className='font-semibold text-slate-900'>{userData.name}</span>
                                    <span className='text-slate-400 text-xs italic'>({userData.prefs.username})</span>
                                </div>
                                {userData.labels.includes('admin') && (
                                    <span className='text-xs font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded-full'>Admin</span>
                                )}
                                <span className="block truncate text-xs text-slate-500 mt-0.5">{userData.email}</span>
                            </Dropdown.Header>

                            <Dropdown.Item href='/profile'>{t('headerProfile')}</Dropdown.Item>
                            <Dropdown.Item href='/settings'>{t('headerSettings')}</Dropdown.Item>
                            <Dropdown.Item href='/help'>{t('headerHelp')}</Dropdown.Item>

                            <div className='mx-3 my-1'>
                                <LanguageSelector />
                            </div>

                            <Dropdown.Divider />
                            <Dropdown.Item onClick={logoutHandler} className='text-red-600 hover:text-red-700'>
                                {t('logout')}
                            </Dropdown.Item>
                        </Dropdown>
                    ) : null}
                    <Navbar.Toggle className='text-brand-200 hover:bg-brand-800 focus:ring-brand-700' />
                </div>

                <Navbar.Collapse className='lg:flex lg:items-center'>
                    {navItems.map((item) => item.active ? (
                        <a
                            key={item.name}
                            href={item.slug}
                            className={`block py-2 px-1 text-sm font-medium transition-colors border-b-2 ${
                                isActive(item.slug)
                                    ? 'text-white border-brand-400'
                                    : 'text-brand-200 border-transparent hover:text-white hover:border-brand-600'
                            }`}
                        >
                            {item.name}
                        </a>
                    ) : null)}
                </Navbar.Collapse>
            </Navbar>
        </header>
    )
}

export default HeaderNew
