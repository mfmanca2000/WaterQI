import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { Provider } from 'react-redux'
import store from './store/store.js'
import Protected from './components/AuthLayout.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Measures from './pages/Measures.jsx'
import MeasureDetail from './pages/MeasureDetail.jsx'
import AddMeasure from './pages/AddMeasure.jsx'
import './i18n';
import Settings from './pages/Settings.jsx'
import Help from './pages/Help.jsx'
import Profile from './pages/Profile.jsx'
import AddReport from './pages/AddReport.jsx'
import ReportDetail from './pages/ReportDetail.jsx'
import Locations from './pages/Locations.jsx'
import LocationDetail from './pages/LocationDetail.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/login',
        element: (
          <Protected authenticationRequired={false}>
            <Login />
          </Protected>
        )
      },
      {
        path: '/signup',
        element: (
          <Protected authenticationRequired={false}>
            <Signup />
          </Protected>
        )
      },
      // {
      //   path: '/measures',
      //   element: (
      //     <Protected authenticationRequired={true}>
      //       <Measures />
      //     </Protected>
      //   )
      // },
      {
        path: '/locations',
        element: (
          <Protected authenticationRequired={true}>
            <Locations />
          </Protected>
        )
      },     
      {
        path: '/mymeasures',
        element: (
          <Protected authenticationRequired={true}>
            <Locations type='mymeasures' />
          </Protected>
        )
      },      
      {
        path: '/mylocations',
        element: (
          <Protected authenticationRequired={true}>
            <Locations type='mylocations' />
          </Protected>
        )
      },
      {
        path: '/myreports',
        element: (
          <Protected authenticationRequired={true}>
            <Locations type='myreports' />
          </Protected>
        )
      },

      {
        path: '/addMeasure',
        element: (
          <Protected authenticationRequired={true}>
            <AddMeasure />
          </Protected>
        )
      },      
      {
        path: '/addReport',
        element: (
          <Protected authenticationRequired={true}>
            <AddReport />
          </Protected>
        )
      },
      {
        path: '/measure/:measureId',
        element: (
          <Protected authenticationRequired={true}>
            <MeasureDetail />
          </Protected>
        )
      },
      
      {
        path: '/location/:locationId',
        element: (
          <Protected authenticationRequired={true}>
            <LocationDetail />
          </Protected>
        )
      },
      {
        path: '/report/:reportId',
        element: (
          <Protected authenticationRequired={true}>
            <ReportDetail />
          </Protected>
        )
      },
      {
        path: '/settings',
        element: (
          <Protected authenticationRequired={true}>
            <Settings />
          </Protected>
        )
      },
      {
        path: '/help',
        element: (

          <Help />

        )
      },
      {
        path: '/profile',
        element: (

          <Protected authenticationRequired={true}>
            <Profile />
          </Protected>

        )
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>,
)
