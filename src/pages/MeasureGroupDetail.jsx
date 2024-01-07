import React from 'react'
import { useEffect, useState } from 'react'
import {useParams, useNavigate} from "react-router-dom"
import databaseService from '../appwrite/database'
import Container from '../components/Container'
import MeasureGroupForm from '../components/MeasureGroupForm.jsx'

function MeasureGroupDetail() {
  const [measureGroup, setMeasureGroup] = useState(null)
  const {measureGroupId} = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (measureGroupId) {
      databaseService.getMeasureGroup(measureGroupId).then((measureGroup) => {
        if (measureGroup) {          
          setMeasureGroup(measureGroup)
        }else {
          navigate("/")
        }
      })
    }
  }, [measureGroupId, navigate])

  return (
    <div className='py-6'>
      <Container>
        <MeasureGroupForm measureGroup={measureGroup}/>
      </Container>
    </div>
  )
}

export default MeasureGroupDetail