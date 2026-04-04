import React from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import SessionDetail from './pages/SessionDetail'
import { Bot, Sparkles } from 'lucide-react'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen text-slate-200 selection:bg-indigo-500/30">
        <header className="sticky top-0 z-50 glass-panel border-b-0 border-slate-800 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-300">
                  <Bot size={28} className="text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-purple-200">
                    AutoBot
                  </h1>
                  <p className="text-[10px] tracking-widest text-indigo-400 font-semibold uppercase flex items-center gap-1">
                    <Sparkles size={10} /> Smart Engine
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 animate-fade-in relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sessions/:id" element={<SessionDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
