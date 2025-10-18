import pcbLogo from './assets/pcbLogo.png'
import './App.css'
import GerberSection from './gerber/gerber.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import { PageLayout } from './components/layout/PageLayout.jsx';
import GitlabIcon from './components/icons/GitlabIcon.jsx';
import GerberSidebar from './components/gerber/GerberSidebar.jsx';
import OutputPanel from './components/gerber/OutputPanel.jsx';
import MainView from './components/gerber/MainViewer.jsx';
import { GerberProvider } from './components/context/GerberContext.jsx';

function App() {

  return (
    <>
      <div className="h-screen flex flex-col">
        <Navbar />

        <GerberProvider>
          <Router>
            <Routes>
              <Route 
                path='/' 
                element={
                  <PageLayout
                    sidebar={<GerberSidebar />}
                    main={<MainView />}
                    right={<OutputPanel />}
                  />
                }
              />
            </Routes>
          </Router>
        </GerberProvider>
        
      </div>

      {/* <div className='px-10 py-6 h-lvh'>
        <nav className="w-full flex justify-between items-center mb-5 navbar h-[6%]">
          <div className='flex items-center ps-5'>
            <img className="w-9" src={ pcbLogo } alt="" />
            <div>
              <span className='gerber'>Gerber</span><span className='two'>2</span><span className='png'>PNG</span>
            </div>
          </div>
          <div className='flex gap-4'>
            <a href="https://git.fablabkerala.in/midlaj/gerber2png/-/wikis/home" target='_blank'>
              <WikiIcon />
            </a>
            <a href="https://git.fablabkerala.in/midlaj/gerber2png" target='_blank'>
              <GitlabIcon />
            </a>
          </div>
        </nav>

        <GerberProvider>
          <GerberSection />
        </GerberProvider>
      </div> */}
    </>
  )
}

export default App
