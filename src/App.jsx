import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar.jsx';
import { PageLayout } from './components/layout/PageLayout.jsx';
import GerberSidebar from './components/gerber/GerberSidebar.jsx';
import OutputPanel from './components/gerber/OutputPanel.jsx';
import MainView from './components/gerber/MainViewer.jsx';
import { GerberProvider } from './components/context/GerberContext.jsx';
import LeftPanel from './components/gcode/LeftPanel.jsx';
import MainPanel from './components/gcode/MainPanel.jsx';
import RightPanel from './components/gcode/RightPanel.jsx';
import { AppProvider } from './components/context/AppContext.jsx';

function App() {
  return (
    <>
      <AppProvider>
        <div className="h-screen flex flex-col">

          <GerberProvider>
            <Router>
              <Navbar />

              <Routes>
                <Route 
                  path='/' 
                  // path='/gerber' 
                  element={
                    <PageLayout
                      sidebar={<GerberSidebar />}
                      main={<MainView />}
                      right={<OutputPanel />}
                    />
                  }
                />
                <Route 
                  // path='/' 
                  path='/gcode' 
                  element={
                    <PageLayout
                      sidebar={<LeftPanel />}
                      main={<MainPanel />}
                      right={<RightPanel />}
                    />
                  }
                />
              </Routes>
            </Router>
          </GerberProvider>
        </div>
      </AppProvider>
    </>
  )
}

export default App
