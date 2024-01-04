import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import databaseService from '../appwrite/database'
import Container from '../components/Container';
import MeasureCard from '../components/MeasureCard';

function Home() {
  const [measures, setMeasures] = useState([]);
  // useEffect(() => {
  //   databaseService.getMeasuresInTimeInterval(new Date('1900-01-01T00:00:00.000Z'), new Date(Date.now())).then((measures) => {
  //     if (measures) {
  //       setMeasures(measures.documents);
  //     }
  //   })
  // }, []);

  useEffect(() => {
    databaseService.getAllMeasures().then((measures) => {
      if (measures) {
        setMeasures(measures.documents);
      }
    })
  }, []);

  if (measures.length === 0){
    return (
      <div className='w-full py-8'>
      <Container>
        <div className='flex flex-wrap'>
          <h1>Login to see all the measures</h1>
        </div>
      </Container>
    </div>
    )
  } else {
    <div className='w-full py-8'>
      <Container>
        <div className='flex flex-wrap'>
          {measures.map((measure) => (
            <div className='p-2 w-1/4' key={measure.$id}>
              <MeasureCard {...measure} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  }
}

export default Home