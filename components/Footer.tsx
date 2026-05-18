"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Code2, Facebook, Twitter, Linkedin, Youtube, Mail, Phone, MapPin } from "lucide-react"

function Footer() {
    const pathname = usePathname()

    // Hide footer on learning pages for immersive experience
    if (pathname.startsWith("/learn")) return null;

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <Code2 className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">skillPeak</span>
                        </div>
                        <p className="text-sm leading-relaxed">
                            Empowering aspiring developers with world-class coding education. Learn, build, and launch your tech career with SkillPeak.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                                <Twitter className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-emerald-600 rounded-lg flex items-center justify-center transition-colors duration-200">
                                <Youtube className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="hover:text-emerald-400 transition-colors duration-200 text-sm">About Us</Link>
                            </li>
                            <li>
                                <Link href="/#courses" className="hover:text-emerald-400 transition-colors duration-200 text-sm">All Courses</Link>
                            </li>
                            <li>
                                <Link href="/instructor" className="hover:text-emerald-400 transition-colors duration-200 text-sm">Become Instructor</Link>
                            </li>
                            <li>
                                <Link href="/success-stories" className="hover:text-emerald-400 transition-colors duration-200 text-sm">Student Success</Link>
                            </li>
                            <li>
                                <Link href="/faqs" className="hover:text-emerald-400 transition-colors duration-200 text-sm">FAQs</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Categories</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/category/web-development" className="hover:text-emerald-400 transition-colors duration-200 text-sm">Web Development</Link>
                            </li>
                            <li>
                                <Link href="/category/full-stack" className="hover:text-emerald-400 transition-colors duration-200 text-sm">Full Stack</Link>
                            </li>
                            <li>
                                <Link href="/category/frontend" className="hover:text-emerald-400 transition-colors duration-200 text-sm">Frontend</Link>
                            </li>
                            <li>
                                <Link href="/category/backend" className="hover:text-emerald-400 transition-colors duration-200 text-sm">Backend</Link>
                            </li>
                            <li>
                                <Link href="/category/mobile-development" className="hover:text-emerald-400 transition-colors duration-200 text-sm">Mobile Development</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-sm">
                                <Mail className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>support@skillpeak.com</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <Phone className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>+91 98765 43210</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm">
                                <MapPin className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>Bangalore, Karnataka, India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 pt-8 mt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-400">
                            © {new Date().getFullYear()} SkillPeak. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm">
                            <Link href="/privacy" className="hover:text-emerald-400 transition-colors duration-200">Privacy Policy</Link>
                            <Link href="/terms" className="hover:text-emerald-400 transition-colors duration-200">Terms of Service</Link>
                            <Link href="/cookie-policy" className="hover:text-emerald-400 transition-colors duration-200">Cookie Policy</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
