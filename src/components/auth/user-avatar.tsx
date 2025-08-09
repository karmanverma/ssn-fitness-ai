'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, FileText } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'

export function UserAvatar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, signOut } = useAuth()

  if (!user) return null

  const handleSignOut = async () => {
    try {
      await signOut()
      setIsOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-full hover:bg-muted transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {getInitials(displayName)}
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-xl shadow-xl z-50"
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-rose-700 rounded-full flex items-center justify-center text-white font-medium">
                    {getInitials(displayName)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{displayName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                <Link
                  href="/report"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted rounded-lg transition-colors"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Reports</span>
                </Link>
                
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted rounded-lg transition-colors"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Profile</span>
                </Link>
                
                <div className="border-t border-border my-2" />
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted rounded-lg transition-colors text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}