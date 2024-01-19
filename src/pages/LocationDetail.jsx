import React from 'react'
import { useEffect, useState } from 'react'
import {useParams, useNavigate} from "react-router-dom"
import databaseService from '../appwrite/database'
import Container from '../components/Container'
import LocationForm from '../components/LocationForm.jsx'

function LocationDetail() {
  const [location, setLocation] = useState(null)
  const {locationId} = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (locationId) {
      databaseService.getLocation(locationId).then((location) => {
        if (location) {          
          setLocation(location)
        }else {
          navigate("/")
        }
      })
    }
  }, [locationId, navigate])

  return (
    <div className='py-6'>
      <Container>
        <LocationForm location={location}/>
      </Container>
    </div>
  )
}

export default LocationDetail