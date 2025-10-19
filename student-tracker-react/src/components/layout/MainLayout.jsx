import React from 'react'
import Header from './Header'
import Footer from './Footer'

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg my-5">
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default MainLayout