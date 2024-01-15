import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import databaseService from '../appwrite/database'
import Container from '../components/Container'
import ReportForm from '../components/ReportForm'

function ReportDetail() {
  const [report, setReport] = useState(null)
  const {reportId} = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    if (reportId) {
      databaseService.getReport(reportId).then((report) => {
        if (report) {          
          setReport(report)
        }else {
          navigate("/")
        }
      })
    }
  }, [reportId, navigate])

  return (
    <div className='py-6'>
      <Container>
        <ReportForm report={report}/>
      </Container>
    </div>
  )
}

export default ReportDetail