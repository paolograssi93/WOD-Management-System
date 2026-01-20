import 'bootstrap/dist/css/bootstrap.min.css'
import './App.css'
import {Route, Routes } from 'react-router'
import { useSelector} from 'react-redux'
import Layout from './layout/layout'
import Dashboard from './pages/Dashboard'
import WodLibrary from './pages/WodLibrary'
import WodDetail from './pages/WodDetail'
import Admin from './pages/Admin'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Home from './pages/Home'
import UserProfile from './pages/UserProfile'
//import store from './redux/store'


function App() {

  const {isAuthenticated, currentUser} = useSelector((state) => state.auth)

  return (

      <Routes>
          <Route path="/login" element={<Login />} />

          {isAuthenticated ? (
          <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/WodLibrary" element={<WodLibrary />} />
          <Route path="/wods/:wodId" element={<WodDetail />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/UserProfile" element={<UserProfile />} />
          
          {/* Protezione Admin */}
          <Route 
            path="/admin" 
            element={currentUser?.role === "admin" ? <Admin /> : <Dashboard />} 
          />
          
          <Route path="*" element={<NotFound />} />
          </Route>
          ) : (
          <Route>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          </Route>
          )}

          <Route path="*" element={<Home />} />

      </Routes>
  )
}

export default App
