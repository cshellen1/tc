import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/home/Home";
import SignUp from "./pages/auth/SignUp";
import Login from "./pages/auth/Login";
import SideBar from "./components/common/SideBar";
import RightPanel from "./components/common/RightPanel";
import ProfilePage from "./pages/profile/ProfilePage";

import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

// Error: Unauthorized: No token provided

function App() {
	const { data: authUser, isLoading } = useQuery({
		// queryKey used to give a name to the query that can be referenced later
		queryKey: ["authUser"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/auth/user");
				const data = await res.json();
				/**
				 * Handles the case where the API response indicates the user is unauthorized due to a missing token.
				 * This can occur when the user's authentication token has expired or is otherwise invalid.
				 * In this case, the function returns `null` to indicate that the user is not authenticated and
				 * the application should handle this appropriately (e.g. redirect the user to the login page).
				 */
				if (data.error === "Unauthorized: No token provided") return null;
				if (!res.ok) throw new Error(data.error || "Something went wrong");
				console.log("authUser is:", data);
				return data;
			} catch (error) {
				console.error(error);
				throw new Error(error);
			}
		},
		retry: false,
	});

	if (isLoading)
		return (
			<div className="h-screen flex justify-center items-center">
				Loading...
			</div>
		);

	return (
		<div className="flex max-w-6xl mx-auto">
			{authUser && <SideBar />}
			<Routes>
				<Route
					path="/"
					element={authUser ? <Home /> : <Navigate to="/login" />}
				/>
				<Route
					path="/signup"
					element={!authUser ? <SignUp /> : <Navigate to="/" />}
				/>
				<Route
					path="/login"
					element={!authUser ? <Login /> : <Navigate to="/" />}
				/>
				<Route
					path="/profile/:username"
					element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
				/>
			</Routes>
			{authUser && <RightPanel />}
			<Toaster />
		</div>
	);
}

export default App;
