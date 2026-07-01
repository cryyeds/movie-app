import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

const Card = ({ title, rating, isCool, actors }) => {
  return (
    <div>
      <h1>{title}</h1>
      <h2>{rating}</h2>
      <h2>{isCool ? "Yes" : "No"}</h2>
      <h2>{actors?.[0]?.name}</h2>
    </div>
  )
}

const App = () => {
  return (
    <>
      <div>
        <h2>Functional Arrow component</h2>
        <Card 
          title='Star Wars' 
          rating={5} 
          isCool={true} 
          actors={[{ name: 'Actors' }]} 
        />

        <Card title='Avatar' />
        <Card title='Lion King' />
      </div>
    </>
  )
}

export default App
