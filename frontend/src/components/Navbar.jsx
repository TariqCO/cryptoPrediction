"use client";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../api/user";
import { Menu, X, Moon, Sun, LogOut, User, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedLogo from "./ui/AnimatedLogo";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const dropdownRef = useRef(null);

  const currentUser = useSelector((s) => s.currentUser.user);
  const dispatch = useDispatch();

  /* Theme */
  useEffect(() => {
    const stored = localStorage.getItem("theme") || "light";
    setTheme(stored);
    document.documentElement.classList.toggle("dark", stored === "dark");
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
  };

  /* Click outside dropdown */
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4">
          {/* Logo */}
          <AnimatedLogo />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            <NavLink
              to="/predictions"
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  "bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200",
                  "hover:bg-gray-200 dark:hover:bg-zinc-700",
                  isActive &&
                    "bg-blue-600 text-white dark:bg-blue-500 dark:text-white"
                )
              }
            >
              <TrendingUp size={16} /> My Predictions
            </NavLink>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-zinc-800 transition"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Auth */}
            {!currentUser ? (
              <Link
                to="/login"
                className="ml-2 px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
              >
                Login
              </Link>
            ) : (
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setDropdownOpen((p) => !p)}
                  className="flex items-center gap-2"
                >
                  <img
                    src={currentUser.profileImage || "/default.png"}
                    className="h-9 w-9 rounded-full ring-2 ring-blue-500/40"
                    alt="User"
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute right-0 mt-3 w-52 rounded-xl bg-white dark:bg-zinc-900 shadow-xl border dark:border-zinc-800 overflow-hidden"
                    >
                      <MenuItem to="/profile" icon={<User size={16} />} label="Profile" />
                      <button
                        onClick={() => logoutUser(dispatch)}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-zinc-800 transition"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="md:hidden"
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-950 border-t dark:border-zinc-800 p-4 md:hidden"
          >
            <NavLink
              to="/predictions"
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-center gap-2 py-3 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
            >
              <TrendingUp size={16} /> My Predictions
            </NavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function MenuItem({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
    >
      {icon} {label}
    </Link>
  );
}
