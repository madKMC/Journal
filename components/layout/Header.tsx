'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from 'next-themes'
import { Moon, Sun, User, LogOut, Settings, PenTool, Monitor } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  onNewEntry?: () => void
}

export function Header({ onNewEntry }: HeaderProps) {
  const { user, signOut } = useAuth()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Ensure component is mounted before rendering theme-dependent content
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/login')
  }

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase()
  }

  // Check if a theme option is currently selected
  const isThemeSelected = (themeValue: string) => {
    if (!mounted) return false
    return theme === themeValue
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sage-200/50 bg-sage-200/80 backdrop-blur-lg supports-[backdrop-filter]:bg-sage-200/60 dark:border-border dark:bg-background/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-mistblue-200 dark:bg-primary rounded-lg flex items-center justify-center">
                <span className="text-charcoal-900 dark:text-primary-foreground font-bold text-sm">J</span>
              </div>
              <h1 className="text-xl font-bold text-charcoal-900 dark:text-foreground">
                My Journal
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {onNewEntry && (
              <Button
                onClick={onNewEntry}
                className="bg-mistblue-200 hover:bg-darkersage-300 dark:bg-primary dark:hover:bg-primary/90 transition-all duration-200 text-charcoal-900 dark:text-primary-foreground"
              >
                <PenTool className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt="User avatar" />
                    <AvatarFallback className="bg-mistblue-200 text-charcoal-900 dark:bg-primary dark:text-primary-foreground">
                      {user?.email ? getInitials(user.email) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium text-charcoal-900 dark:text-foreground">{user?.user_metadata?.full_name || 'User'}</p>
                    <p className="w-[200px] truncate text-sm text-mutedgray-500 dark:text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-charcoal-700 dark:text-foreground" onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-charcoal-700 dark:text-foreground" onClick={() => router.push('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-charcoal-700 dark:text-foreground" onClick={() => setTheme('light')}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Light Theme</span>
                  {isThemeSelected('light') && <span className="ml-auto text-sage-600 dark:text-sage-400">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-charcoal-700 dark:text-foreground" onClick={() => setTheme('dark')}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Dark Theme</span>
                  {isThemeSelected('dark') && <span className="ml-auto text-sage-600 dark:text-sage-400">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-charcoal-700 dark:text-foreground" onClick={() => setTheme('system')}>
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>System Theme</span>
                  {isThemeSelected('system') && <span className="ml-auto text-sage-600 dark:text-sage-400">✓</span>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 dark:text-red-400" onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}