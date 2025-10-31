import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import FastTimetableApp from './Components/TimeTable'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <FastTimetableApp/>
    </>
  )
}

export default App
