import logo from './logo.svg';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Register from './components/Register';
import Challenges from './components/Challenges';
import Navbar from './components/Navbar';
import Community from './components/Community';
import Dashboard from './components/Dashboard';
import Editor from './components/editor';
import Leaderboard from './components/leaderboard';
function App() {
  return (
    <div className="App">
      <Navbar />
      <Routes>
        {/* Use `element={<Component />}` instead of `element={Component}` */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/community" element={<Community/>} />
        <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="/editor" element={<Editor/>} />
        <Route path="/leaderboard" element={<Leaderboard />} />

      </Routes>
    </div>
  );
}

export default App;
