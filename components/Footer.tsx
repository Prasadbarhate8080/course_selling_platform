"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

function Footer() {
    const pathname = usePathname()

    // Hide footer on learning pages for immersive experience
    if (pathname.startsWith("/learn")) return null;

    return (
        <footer className="border-t bg-background mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/">
                            <span className="text-2xl font-bold text-primary tracking-tight">skillPeak</span>
                        </Link>
                        <p className="mt-4 text-muted-foreground max-w-xs">
                            Master Full Stack Java, Spring Boot, and Modern Web Architecture with industry-leading courses designed for the next generation of software engineers.
                        </p>
                    </div>
                    
                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Contact Us
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Legal</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Terms
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/refund-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                                    Refund Policy
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <div className="mt-12 pt-8 border-t border-muted text-center">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} SkillPeak. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
