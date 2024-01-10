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
import MeasureGroups from './pages/MeasureGroups.jsx'
import EditMeasure from './pages/EditMeasure.jsx'
import MeasureDetail from './pages/MeasureDetail.jsx'
import AddMeasure from './pages/AddMeasure.jsx'
import AddMeasureGroup from './pages/AddMeasureGroup.jsx'
import MeasureGroupDetail from './pages/MeasureGroupDetail.jsx'
import './i18n';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App/>,
    children: [
      {
        path: '/',
        element: <Home/>
      },
      {
        path: '/login',
        element: (
          <Protected authenticationRequired={false}>
            <Login/>
          </Protected>
        )
      },
      {
        path: '/signup',
        element: (
          <Protected authenticationRequired={false}>
            <Signup/>
          </Protected>
        )
      },
      {
        path: '/measures',
        element: (
          <Protected authenticationRequired={true}>
            <Measures/>
          </Protected>
        )
      },
      {
        path: '/measureGroups',
        element: (
          <Protected authenticationRequired={true}>
            <MeasureGroups/>
          </Protected>
        )
      },
      {
        path: '/addMeasure',
        element: (
          <Protected authenticationRequired={true}>
            <AddMeasure/>
          </Protected>
        )
      },
      {
        path: '/addMeasureGroup',
        element: (
          <Protected authenticationRequired={true}>
            <AddMeasureGroup/>
          </Protected>
        )
      },
      {
        path: '/measure/:measureId',
        element: (
          <Protected authenticationRequired={true}>
            <MeasureDetail/>
          </Protected>
        )
      },
      {
        path: '/measureGroup/:measureGroupId',
        element: (
          <Protected authenticationRequired={true}>
            <MeasureGroupDetail/>
          </Protected>
        )
      },
      {
        path: '/editMeasure/:measureId',
        element: (
          <Protected authenticationRequired={true}>
            <EditMeasure/>
          </Protected>
        )
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>    
  </React.StrictMode>,
)
