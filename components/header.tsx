"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/nexora-logo.png"
              alt="Nexora - Together in Care"
              width={1000}
              height={1000}
              className="h-36 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/professionals"
              className="text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Find Professionals
            </Link>
            <Link href="/about" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/resources" className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
              Resources
            </Link>
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="h-10 w-10 p-0"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                href="/professionals"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Find Professionals
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="/resources"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Resources
              </Link>
              <div className="border-t pt-4 mt-4">
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start" asChild>
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button className="w-full" asChild>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}