'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PenTool, Heart, Shield, Sparkles } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sand-100">
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 bg-sage-200 rounded-xl mx-auto mb-4"></div>
          <p className="text-mutedgray-500">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sand-100">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-sage-200 rounded-2xl mx-auto mb-6 sm:mb-8 flex items-center justify-center">
            <PenTool className="h-6 w-6 sm:h-8 sm:w-8 text-charcoal-900" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-charcoal-900 mb-4 sm:mb-6 leading-tight">
            SoulScriptJournal
          </h1>
          <p className="text-lg sm:text-xl text-mutedgray-500 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
            Capture your thoughts, reflect on your journey, and create lasting memories with our beautiful, secure journaling platform designed for your soul's expression.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Button
              size="lg"
              className="bg-mistblue-200 hover:bg-darkersage-300 transition-all duration-200 text-lg px-8 py-3 text-charcoal-900 border-0 w-full sm:w-auto"
              onClick={() => router.push('/auth/signup')}
            >
              Start Your Journey
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-3 hover:bg-sage-50 border-sage-200 text-charcoal-700 w-full sm:w-auto"
              onClick={() => router.push('/auth/login')}
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 bg-blushrose-400 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-semibold text-charcoal-900">
                Express Your Soul
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-mutedgray-500 text-center">
                Write freely with our intuitive editor. Add images, track your moods, and let your soul's voice flow without limits through SoulScriptJournal.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 bg-sage-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-6 w-6 text-charcoal-900" />
              </div>
              <CardTitle className="text-xl font-semibold text-charcoal-900">
                Sacred & Secure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-mutedgray-500 text-center">
                Your innermost thoughts are sacred to us. All entries are private by default with enterprise-grade security protecting your personal journey.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow duration-200">
            <CardHeader className="text-center pb-6">
              <div className="w-12 h-12 bg-mistblue-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-charcoal-900" />
              </div>
              <CardTitle className="text-xl font-semibold text-charcoal-900">
                Soul Inspiration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-mutedgray-500 text-center">
                Never run out of inspiration with our curated writing prompts designed to spark deep reflection and connect you with your inner wisdom.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-mutedgray-400 text-sm px-4">
            Join thousands of souls who trust SoulScriptJournal with their most precious thoughts and memories.
          </p>
        </div>
      </div>
    </div>
  )
}