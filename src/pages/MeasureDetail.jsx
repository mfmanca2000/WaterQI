import React from 'react'
import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from "react-router-dom"
import databaseService from '../appwrite/database'
import Container from '../components/Container'
import MeasureForm from '../components/MeasureForm.jsx'

function MeasureDetail() {

  const [measure, setMeasure] = useState(null)
  const { measureId } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (measureId) {
      databaseService.getMeasure(measureId).then((measure) => {
        if (measure) {
          setMeasure(measure)
        } else {
          navigate("/")
        }
      })
    }
  }, [measureId, navigate])

  return (
    <>
      <Container>
        <Link className='underline font-bold m-2' to={'..'} onClick={(e) => {
          e.preventDefault();
          navigate(-1);
        }}
        >
          Return to measures
        </Link>
      </Container>
      <div className='py-6'>
        <Container>
          <MeasureForm measure={measure} />
        </Container>
      </div>
    </>
  )
}

export default MeasureDetail