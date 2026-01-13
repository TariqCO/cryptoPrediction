"use client";
import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../api/user";
import {
  Menu,
  X,
  Moon,
  Sun,
  LogOut,
  User,
  Settings,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AnimatedLogo from "./ui/AnimatedLogo";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  const currentUser = useSelector((s) => s.currentUser.user);

  const dispatch = useDispatch();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "light" ? "dark" : "light"));

  const navItems = [
    { to: "/predictions", label: "Predictions" },
    { to: "/rankings", label: "Rankings" },
    { to: "/leaderboard", label: "Leaderboard" },
  ];

  const renderLinks = (cls = "") =>
    navItems.map(({ to, label }) => (
      <NavLink
        key={to}
        to={to}
        className={({ isActive }) =>
          cn(
            cls,
            "flex-1 text-center px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
            isActive
              ? "bg-blue-100/60 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
              : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800"
          )
        }
        onClick={() => setMobileOpen(false)}
      >
        {label}
      </NavLink>
    ));

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white backdrop-blur-sm border-b border-gray-300 shadow-md dark:bg-zinc-950/70 dark:border-zinc-800 transition-colors">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4">
          <AnimatedLogo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {renderLinks("px-3 py-2")}
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors text-gray-700 dark:text-gray-300 focus:outline-none focus:ring focus:ring-blue-300 dark:focus:ring-blue-700"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Auth / Profile */}
            {!currentUser ? (
              <div className="flex gap-2 items-center">
                <Link
                  to="/login"
                  className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={currentUser.profileImage || "/default.png"}
                    alt="avatar"
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-blue-500/40 shadow-sm"
                  />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-3 z-50 w-48 rounded-xl bg-white/95 dark:bg-zinc-900 shadow-md border border-gray-200 dark:border-zinc-800 overflow-hidden"
                    >
                      <div className="absolute -top-2 right-5 w-3 h-3 bg-white/95 dark:bg-zinc-900 rotate-45 border-l border-t border-gray-200 dark:border-zinc-800"></div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User size={16} /> Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings size={16} /> Settings
                      </Link>
                      <button
                        onClick={() => {
                          logoutUser(dispatch);
                          setDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-100/80 dark:hover:bg-zinc-800 transition"
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
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-gray-700 dark:text-white focus:outline-none"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
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
            transition={{ duration: 0.25 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-zinc-950 border-t border-gray-300 dark:border-zinc-800 p-4 shadow-inner md:hidden"
          >
            <div className="flex flex-col space-y-3">{renderLinks()}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
