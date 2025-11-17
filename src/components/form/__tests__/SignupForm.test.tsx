/* eslint-disable @typescript-eslint/no-explicit-any */

import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { SignupForm } from '../SignupForm'
import * as authModule from '@/lib/firebase/auth'
import * as safeAsyncModule from '@/utils/safeAsync/safeAsync'

jest.mock('@/lib/firebase/auth')
jest.mock('@/utils/safeAsync/safeAsync')

describe('SignupForm', () => {
  const mockSignupWithEmail = jest.fn()
  const mockLoginWithGoogle = jest.fn()
  const mockSafeAsync = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock window.location
    delete (window as any).location
    window.location = { href: '' } as any
    
    ;(authModule.signupWithEmail as jest.Mock) = mockSignupWithEmail
    ;(authModule.loginWithGoogle as jest.Mock) = mockLoginWithGoogle
    ;(safeAsyncModule.default as jest.Mock) = mockSafeAsync
  })

  describe('Rendering', () => {
    it('should render the signup form with all elements', () => {
      render(<SignupForm />)

      expect(screen.getByRole('heading', { name: /crea tu cuenta/i })).toBeInTheDocument()
      expect(screen.getByText(/ingresa tus datos para comenzar/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^correo electrónico/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /crear cuenta/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continuar con google/i })).toBeInTheDocument()
    })

    it('should render password requirements hint', () => {
      render(<SignupForm />)
      expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument()
    })

    it('should render login link', () => {
      render(<SignupForm />)
      expect(screen.getByText(/¿ya tienes una cuenta\?/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /inicia sesión/i })).toHaveAttribute('href', '/login')
    })
  })

  describe('Email/Password Signup', () => {
    it('should handle successful email signup', async () => {
      const user = userEvent.setup()
      const mockUser = { 
        uid: '123', 
        email: 'test@test.com',
        getIdToken: jest.fn().mockResolvedValue('fake-token')
      }
      mockSafeAsync.mockResolvedValue([mockUser, null])

      render(<SignupForm />)

      const emailInput = screen.getByLabelText(/^correo electrónico/i)
      const passwordInput = screen.getByLabelText(/^contraseña$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockSignupWithEmail).toHaveBeenCalledWith('test@test.com', 'password123')
      })
    })

    it('should display error when passwords do not match', async () => {
      const user = userEvent.setup()

      render(<SignupForm />)

      const emailInput = screen.getByLabelText(/^correo electrónico/i)
      const passwordInput = screen.getByLabelText(/^contraseña$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'differentpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
        expect(mockSignupWithEmail).not.toHaveBeenCalled()
      })
    })

    it('should display error message on failed signup', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Email already in use'
      mockSafeAsync.mockResolvedValue([null, { message: errorMessage }])

      render(<SignupForm />)

      const emailInput = screen.getByLabelText(/^correo electrónico/i)
      const passwordInput = screen.getByLabelText(/^contraseña$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('should disable inputs and show loading state during submission', async () => {
      const user = userEvent.setup()
      mockSafeAsync.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([null, null]), 100)))

      render(<SignupForm />)

      const emailInput = screen.getByLabelText(/^correo electrónico/i)
      const passwordInput = screen.getByLabelText(/^contraseña$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      expect(screen.getByRole('button', { name: /creando cuenta.../i })).toBeInTheDocument()
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
      expect(confirmPasswordInput).toBeDisabled()
    })

    it('should require all fields', () => {
      render(<SignupForm />)

      const emailInput = screen.getByLabelText(/^correo electrónico/i)
      const passwordInput = screen.getByLabelText(/^contraseña$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)

      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()
      expect(confirmPasswordInput).toBeRequired()
    })
  })

  describe('Google Signup', () => {
    it('should handle successful Google signup', async () => {
      const user = userEvent.setup()
      const mockUser = { 
        uid: '123', 
        email: 'test@gmail.com',
        getIdToken: jest.fn().mockResolvedValue('fake-token')
      }
      mockSafeAsync.mockResolvedValue([mockUser, null])

      render(<SignupForm />)

      const googleButton = screen.getByRole('button', { name: /continuar con google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(mockLoginWithGoogle).toHaveBeenCalled()
      })
    })

    it('should display error message on failed Google signup', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Google signup failed'
      mockSafeAsync.mockResolvedValue([null, { message: errorMessage }])

      render(<SignupForm />)

      const googleButton = screen.getByRole('button', { name: /continuar con google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('should disable all buttons during Google signup', async () => {
      const user = userEvent.setup()
      mockSafeAsync.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([null, null]), 100)))

      render(<SignupForm />)

      const googleButton = screen.getByRole('button', { name: /continuar con google/i })
      await user.click(googleButton)

      const submitButton = screen.getByRole('button', { name: /creando cuenta.../i })
      expect(submitButton).toBeDisabled()
      expect(googleButton).toBeDisabled()
    })
  })

  describe('Form Validation', () => {
    it('should have email input with correct type', () => {
      render(<SignupForm />)
      const emailInput = screen.getByLabelText(/^correo electrónico/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should have password inputs with correct type', () => {
      render(<SignupForm />)
      const passwordInput = screen.getByLabelText(/^contraseña$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      expect(confirmPasswordInput).toHaveAttribute('type', 'password')
    })

    it('should display placeholder for password requirements', () => {
      render(<SignupForm />)
      const passwordInput = screen.getByLabelText(/^contraseña$/i)
      expect(passwordInput).toHaveAttribute('placeholder', 'Mínimo 6 caracteres')
    })

    it('should clear error message on new submission', async () => {
      const user = userEvent.setup()
      mockSafeAsync
        .mockResolvedValueOnce([null, { message: 'First error' }])
        .mockResolvedValueOnce([{ 
          uid: '123',
          getIdToken: jest.fn().mockResolvedValue('fake-token')
        }, null])

      render(<SignupForm />)

      const emailInput = screen.getByLabelText(/^correo electrónico/i)
      const passwordInput = screen.getByLabelText(/^contraseña$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      // First submission with error
      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'pass123')
      await user.type(confirmPasswordInput, 'pass123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument()
      })

      // Clear and try again
      await user.clear(passwordInput)
      await user.clear(confirmPasswordInput)
      await user.type(passwordInput, 'newpass123')
      await user.type(confirmPasswordInput, 'newpass123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument()
      })
    })

    it('should show password mismatch error before calling API', async () => {
      const user = userEvent.setup()

      render(<SignupForm />)

      const emailInput = screen.getByLabelText(/^correo electrónico/i)
      const passwordInput = screen.getByLabelText(/^contraseña$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password1')
      await user.type(confirmPasswordInput, 'password2')
      await user.click(submitButton)

      // Should show error immediately without loading state
      expect(screen.getByText(/las contraseñas no coinciden/i)).toBeInTheDocument()
      expect(mockSafeAsync).not.toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      render(<SignupForm />)
      
      expect(screen.getByLabelText(/^correo electrónico/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/^contraseña$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirmar contraseña/i)).toBeInTheDocument()
    })

    it('should display error in an accessible way', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Error message'
      mockSafeAsync.mockResolvedValue([null, { message: errorMessage }])

      render(<SignupForm />)

      const emailInput = screen.getByLabelText(/^correo electrónico/i)
      const passwordInput = screen.getByLabelText(/^contraseña$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirmar contraseña/i)
      const submitButton = screen.getByRole('button', { name: /crear cuenta/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        const errorDiv = screen.getByText(errorMessage)
        expect(errorDiv).toBeInTheDocument()
        expect(errorDiv).toHaveClass('text-red-400')
      })
    })

    it('should provide helpful description for password requirements', () => {
      render(<SignupForm />)
      expect(screen.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeInTheDocument()
    })
  })
})
