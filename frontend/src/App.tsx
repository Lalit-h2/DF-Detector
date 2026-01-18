import { useState } from 'react'
import './App.css'
import { Route, Routes } from 'react-router-dom'
import Uploader from './components/Uploader'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Routes>
      <Route element={<Uploader/>} path='/'/>
      </Routes>
    </>
  )
}

export default App
