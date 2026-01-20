import { Outlet } from "react-router"
import Navbar from "./Navbar"
import Footer from "./Footer"
import { useSelector } from "react-redux"

const Layout = () => {

  const {isAuthenticated} = useSelector((state) => state.auth)
  return (
    <>
      {isAuthenticated && <Navbar />}
      <Outlet />
      {/* Outlet rappresenta un "segnaposto" che mi serve per indicare dove dovranno essere posizionate le vari pagine Home, Admin ecc ecc */}
      <Footer />
    </>
  )
}

export default Layout