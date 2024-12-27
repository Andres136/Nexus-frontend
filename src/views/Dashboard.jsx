import React, { useState } from 'react'
import useSystem from '../hooks/useSystem'

export default function Dashboard() {
    const { darkMode, toggleDarkMode}= useSystem()
 


  return (
    <div className={darkMode ? "min-h-screen bg-gray-900 text-white p-6" : "min-h-screen bg-gray-100 text-gray-900 p-6"}>
      
    </div>
  )
}
