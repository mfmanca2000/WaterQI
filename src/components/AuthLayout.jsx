//import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useState, useEffect } from 'react';

function Protected({children, authenticationRequired = true}) {
  const loggedIn = useSelector((state) => state.auth.loggedIn);
  const navigate = useNavigate();
  const [loader, setLoader] = useState(true)

  useEffect(() => {
    if (authenticationRequired && !loggedIn) {
      navigate('/login');
    } else if (!authenticationRequired && loggedIn) {
      navigate('/');
    } 
    setLoader(false);
  }, [loggedIn, authenticationRequired, navigate])

  return loader ? null : <>{children}</>
}

export default Protected