'use client'

import { useAuth } from '@/contexts/AuthContext'
import { LogIn, LogOut, User, Mail, Shield } from 'lucide-react'

export default function FirebaseTestPage() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background cyber-grid-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-cyber-blue mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading Firebase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background cyber-grid-bg">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyber-blue/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyber-purple/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <img 
                src="/logo.svg" 
                alt="PICUS Logo" 
                className="h-20 relative z-10 drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]"
              />
            </div>
          </div>
          <h1 className="text-4xl font-black text-foreground mb-2 glow-text">
            <span className="bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
              🔥 Firebase Test Page
            </span>
          </h1>
          <p className="text-muted-foreground">Testing Firebase Authentication Integration</p>
        </div>

        {/* Main Content */}
        {!user ? (
          // Not logged in
          <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-[0_0_50px_rgba(58,134,255,0.3)] p-8 border-2 border-border">
            <div className="text-center mb-8">
              <Shield className="w-20 h-20 mx-auto mb-4 text-cyber-blue opacity-50" />
              <h2 className="text-2xl font-bold text-foreground mb-2">Not Logged In</h2>
              <p className="text-muted-foreground">Sign in to test Firebase authentication</p>
            </div>

            <button
              onClick={signInWithGoogle}
              className="w-full py-4 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink text-white rounded-lg hover:shadow-[0_0_30px_rgba(58,134,255,0.6)] transition-all font-bold text-lg inline-flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink via-cyber-purple to-cyber-blue opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <LogIn className="w-6 h-6 relative z-10" />
              <span className="relative z-10">Sign in with Google</span>
            </button>

            <div className="mt-8 p-4 bg-cyber-blue/10 rounded-lg border border-cyber-blue/30">
              <p className="text-sm text-muted-foreground">
                <strong className="text-cyber-blue">ℹ️ Note:</strong> Make sure you've enabled Google Sign-In in Firebase Console
              </p>
            </div>
          </div>
        ) : (
          // Logged in
          <div className="space-y-6">
            {/* User Info Card */}
            <div className="bg-card/80 backdrop-blur-sm rounded-2xl shadow-[0_0_50px_rgba(58,134,255,0.3)] p-8 border-2 border-border">
              <div className="flex items-center gap-6 mb-6">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-20 h-20 rounded-full border-4 border-cyber-blue shadow-[0_0_20px_rgba(58,134,255,0.5)]"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center text-white text-3xl font-bold">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-1">
                    ✅ Authentication Successful!
                  </h2>
                  <p className="text-muted-foreground">You are now logged in with Firebase</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Display Name */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyber-blue/10 to-cyber-purple/10 rounded-lg border border-cyber-blue/30">
                  <User className="w-5 h-5 text-cyber-blue" />
                  <div>
                    <p className="text-xs text-muted-foreground">Display Name</p>
                    <p className="text-foreground font-bold">{user.displayName || 'N/A'}</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyber-purple/10 to-cyber-pink/10 rounded-lg border border-cyber-purple/30">
                  <Mail className="w-5 h-5 text-cyber-purple" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-foreground font-bold">{user.email || 'N/A'}</p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-cyber-cyan/10 to-cyber-blue/10 rounded-lg border border-cyber-cyan/30">
                  <Shield className="w-5 h-5 text-cyber-cyan" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">User ID (UID)</p>
                    <p className="text-foreground font-mono text-sm break-all">{user.uid}</p>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={signOut}
                className="w-full mt-6 py-3 bg-gradient-to-r from-cyber-pink/20 to-destructive/20 border-2 border-cyber-pink/50 text-cyber-pink rounded-lg hover:shadow-[0_0_20px_rgba(255,0,110,0.5)] transition-all font-bold inline-flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>

            {/* Success Message */}
            <div className="bg-gradient-to-br from-cyber-green/10 via-cyber-cyan/10 to-cyber-blue/10 rounded-xl p-6 border-2 border-cyber-green/30">
              <h3 className="font-bold text-foreground mb-2 flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <span>Firebase is Working!</span>
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your Firebase Authentication is properly configured and working. You can now proceed to integrate Firestore for real-time data sync.
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-card/50 backdrop-blur-sm rounded-lg p-6 border border-border">
              <h3 className="font-bold text-foreground mb-3">📋 Next Steps:</h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>✅ <strong className="text-cyber-green">Step 1:</strong> Firebase Authentication - DONE!</li>
                <li>🔄 <strong className="text-cyber-blue">Step 2:</strong> Enable Firestore Database</li>
                <li>🔄 <strong className="text-cyber-purple">Step 3:</strong> Add Security Rules</li>
                <li>🔄 <strong className="text-cyber-pink">Step 4:</strong> Integrate Real-time Sync</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

