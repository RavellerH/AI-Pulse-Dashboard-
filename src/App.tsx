import { HashRouter, Routes, Route } from 'react-router-dom'
import SidebarNav from './components/shell/SidebarNav'
import TopBar from './components/shell/TopBar'
import BottomNav from './components/shell/BottomNav'
import Overview from './pages/Overview'
import Feed from './pages/Feed'
import People from './pages/People'
import PersonDetail from './pages/PersonDetail'
import Topics from './pages/Topics'
import Briefings from './pages/Briefings'
import About from './pages/About'

export default function App() {
  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden bg-bg">
        <SidebarNav />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto pb-14 md:pb-0">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/people" element={<People />} />
              <Route path="/people/:handle" element={<PersonDetail />} />
              <Route path="/topics" element={<Topics />} />
              <Route path="/briefings" element={<Briefings />} />
              <Route path="/about" element={<About />} />
            </Routes>
          </main>
        </div>
      </div>
      <BottomNav />
    </HashRouter>
  )
}
