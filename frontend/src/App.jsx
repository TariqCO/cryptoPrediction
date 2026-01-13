import { Routes, Route, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useEffect, Suspense, lazy } from "react";
import { ToastContainer } from "react-toastify";
import { setCurrentUser } from "./redux/feature/userSlice.js";
import { fetchCurrentUser } from "./api/user.js";
import "react-toastify/dist/ReactToastify.css";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Signup = lazy(() => import("./pages/Signup.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const MyPredictions = lazy(() => import("./pages/MyPredictions.jsx"));
const NotFound = lazy(() => import("./components/NotFound.jsx"));
const Navbar = lazy(() => import("./components/Navbar.jsx"));
const PrivateRoute = lazy(() => import("./components/PrivateRoutes.jsx")); 

function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await fetchCurrentUser();
        dispatch(setCurrentUser(user));
      } catch (err) {
        dispatch(setCurrentUser(null));
      }
    };
    loadUser();
  }, [dispatch]);

  const hideNavbarRoutes = ["/login", "/register"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="min-h-screen dark:bg-black">
        {!hideNavbar && <Navbar />}

        <Suspense fallback={<div className="text-center p-10 text-gray-500">Loading...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/register" element={<Signup />} />
            <Route path="/login" element={<Login />} />

            {/* 🔒 Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/predictions" element={<MyPredictions />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </div>
    </>
  );
}

export default App;
