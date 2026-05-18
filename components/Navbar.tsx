"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "./ui/button"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Code2 } from "lucide-react"

function Navbar() {
    const { data: session } = useSession()
    const pathname = usePathname()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Hide navbar on learning pages
    if (pathname.startsWith("/learn")) return null;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 cursor-pointer group">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                            <Code2 className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">skillPeak</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium">
                            Home
                        </Link>
                        <Link href="/#courses" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium">
                            Courses
                        </Link>
                        <Link href="/contact" className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium">
                            Contact
                        </Link>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        {session ? (
                            <>
                                <span className="text-sm font-medium text-gray-600 mr-2">
                                    Welcome, {session.user.userName || session.user.email}
                                </span>
                                <Button 
                                    variant="ghost" 
                                    className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50"
                                    onClick={() => signOut()}
                                >
                                    Sign out
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/sign-in">
                                    <Button variant="ghost" className="text-gray-700 hover:text-emerald-600 hover:bg-emerald-50">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/sign-up">
                                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                        className="md:hidden p-2 text-gray-700 hover:text-emerald-600 transition-colors duration-200"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-gray-200 animate-in slide-in-from-top-2 duration-200">
                        <nav className="flex flex-col gap-4">
                            <Link 
                                href="/" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium px-2"
                            >
                                Home
                            </Link>
                            <Link 
                                href="/#courses" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium px-2"
                            >
                                Courses
                            </Link>
                            <Link 
                                href="/contact" 
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-gray-700 hover:text-emerald-600 transition-colors duration-200 font-medium px-2"
                            >
                                Contact
                            </Link>
                            
                            <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                                {session ? (
                                    <Button 
                                        variant="outline" 
                                        className="w-full"
                                        onClick={() => {
                                            signOut();
                                            setMobileMenuOpen(false);
                                        }}
                                    >
                                        Sign Out
                                    </Button>
                                ) : (
                                    <>
                                        <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                                            <Button variant="outline" className="w-full">Login</Button>
                                        </Link>
                                        <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Sign Up</Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}

export default Navbar
