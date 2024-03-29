import { useState, useEffect } from 'react'
import './App.css'
import { Outlet } from 'react-router-dom'
import Footer from './components/Footer.jsx'
import { useDispatch } from "react-redux";
import { login, logout } from "./store/authSlice";
import authService from './appwrite/auth'
import HeaderNew from './components/HeaderNew'

function App() {

    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();

    useEffect(() => {
        authService
            .getCurrentUser()
            .then((userData) => {
                if (userData) dispatch(login({ userData }));
                else dispatch(logout());
            })
            .finally(() => setLoading(false));
    }, [dispatch]);

    return !loading ? (
        <div className="min-h-screen flex flex-wrap content-between bg-white" >

            <div className="w-full block">
                <HeaderNew />
                <main>
                    <Outlet />
                </main>
            </div>
            <div className="w-full block">
                <Footer />
            </div>
        </div>
    ) : null;
}

export default App
