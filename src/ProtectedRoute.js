import { Outlet, Navigate } from 'react-router-dom'
import { authAPI } from './components/Main/Api.js'
import { useEffect, useState } from 'react'


const ProtectedRoutes = () => {

  const [user, setUser] = useState(null)

  async function checkAdmin() {

    const res = await authAPI()

    if (res.data.loggedIn === true && res.data.isAdmin === true) {

      setUser(true)
    } else {

      setUser(false)
    }
  }

  useEffect(() => {

    checkAdmin()

  }, [])

  if (user === null) {
    return;
  }

  return user ? <Outlet /> : <Navigate to="/" />
}

export default ProtectedRoutes