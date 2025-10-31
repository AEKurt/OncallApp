'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LogIn } from 'lucide-react'

export function LoginPage() {
  const { signInWithGoogle, loading } = useAuth()

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('Login failed:', error)
      alert('Login failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background cyber-grid-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyber-blue mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background cyber-grid-bg flex items-center justify-center">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <img 
              src="/logo.svg" 
              alt="PICUS Logo" 
              className="h-20 relative z-10 drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]"
            />
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-[0_0_50px_rgba(58,134,255,0.3)] p-8 border-2 border-border">
          <h1 className="text-3xl font-black text-center text-foreground mb-2 glow-text">
            <span className="bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
              ON-CALL SCHEDULE
            </span>
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Sign in to manage your team's schedule
          </p>

          <button
            onClick={handleSignIn}
            className="w-full py-4 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink text-white rounded-lg hover:shadow-[0_0_30px_rgba(58,134,255,0.6)] transition-all font-bold text-lg inline-flex items-center justify-center gap-3 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink via-cyber-purple to-cyber-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <LogIn className="w-6 h-6 relative z-10" />
            <span className="relative z-10">Sign in with Google</span>
          </button>

          <p className="text-xs text-muted-foreground text-center mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border">
          <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <span>Features</span>
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Real-time team collaboration</li>
            <li>• Automatic schedule generation</li>
            <li>• Fair load distribution</li>
            <li>• Custom weight settings</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

