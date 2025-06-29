'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type LoginFormData = z.infer<typeof loginSchema>
type SignupFormData = z.infer<typeof signupSchema>

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export function AuthForm({ mode }: AuthFormProps) {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const schema = mode === 'login' ? loginSchema : signupSchema
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData | SignupFormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: LoginFormData | SignupFormData) => {
    setLoading(true)
    try {
      let error
      if (mode === 'login') {
        const { error: signInError } = await signIn(data.email, data.password)
        error = signInError
      } else {
        const signupData = data as SignupFormData
        const { error: signUpError } = await signUp(signupData.email, signupData.password, signupData.fullName)
        error = signUpError
      }

      if (error) {
        // Handle specific error cases with user-friendly messages
        if (error.message.includes('email_not_confirmed') || error.message.includes('Email not confirmed')) {
          toast.error('Please check your email for a verification link to confirm your account.')
        } else if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
          toast.error('Invalid email or password. Please check your credentials and try again.')
        } else {
          toast.error(error.message)
        }
      } else {
        toast.success(mode === 'login' ? 'Welcome back!' : 'Account created successfully!')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="w-12 h-12 bg-sage-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <span className="text-charcoal-900 font-bold text-xl">J</span>
          </div>
          <CardTitle className="text-2xl font-bold text-charcoal-900">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </CardTitle>
          <CardDescription className="text-mutedgray-500">
            {mode === 'login' 
              ? 'Sign in to your journal to continue your story' 
              : 'Start your journaling journey today'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-charcoal-700">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  {...register('fullName' as keyof (LoginFormData | SignupFormData))}
                  className="h-11 border-sage-200 focus:border-sage-400"
                />
                {'fullName' in errors && errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-charcoal-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                className="h-11 border-sage-200 focus:border-sage-400"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-charcoal-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  {...register('password')}
                  className="h-11 pr-10 border-sage-200 focus:border-sage-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mutedgray-500 hover:text-charcoal-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-charcoal-700">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    {...register('confirmPassword' as keyof (LoginFormData | SignupFormData))}
                    className="h-11 pr-10 border-sage-200 focus:border-sage-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-mutedgray-500 hover:text-charcoal-700"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {'confirmPassword' in errors && errors.confirmPassword && (
                  <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-mistblue-200 hover:bg-darkersage-300 transition-all duration-200 text-charcoal-900"
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-mutedgray-500">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <a
                href={mode === 'login' ? '/auth/signup' : '/auth/login'}
                className="text-sage-600 hover:text-sage-800 font-medium transition-colors"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}