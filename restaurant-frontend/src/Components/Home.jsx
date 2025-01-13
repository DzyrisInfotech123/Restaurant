import React from 'react'
import Header from "./Header";
import Categories from "./Categories";
import Restaurants from "./Restaurants";


const Home = () => {
  return (
    <div className="app">
    <Header />
    <main className="container mx-auto p-4">
      
      <Restaurants />
      <Categories />
    </main>
  </div>
  )
}

export default Home
