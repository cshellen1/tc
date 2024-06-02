import {Routes, Route} from'react-router-dom';
import Home from './pages/home/Home';
import SignUp from './pages/auth/SignUp';
import Login from './pages/auth/Login';
import SideBar from './components/common/SideBar';
import RightPanel from './components/common/RightPanel';
import ProfilePage from './pages/profile/ProfilePage';


function App() {
	return (
		<div className="flex max-w-6xl mx-auto">
			<SideBar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/signup" element={<SignUp />} />
				<Route path="/login" element={<Login />} />
				<Route path="/profile/:username" element={<ProfilePage />} />
			</Routes>
			<RightPanel />
		</div>
	);
}

export default App;
