import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'
import * as authModule from '@/lib/firebase/auth'
import * as safeAsyncModule from '@/utils/safeAsync/safeAsync'

// Mock the modules
jest.mock('@/lib/firebase/auth')
jest.mock('@/utils/safeAsync/safeAsync')

describe('LoginForm', () => {
  const mockLoginWithEmail = jest.fn()
  const mockLoginWithGoogle = jest.fn()
  const mockSafeAsync = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock window.location
    delete (window as any).location
    window.location = { href: '' } as any
    
    ;(authModule.loginWithEmail as jest.Mock) = mockLoginWithEmail
    ;(authModule.loginWithGoogle as jest.Mock) = mockLoginWithGoogle
    ;(safeAsyncModule.default as jest.Mock) = mockSafeAsync
  })

  describe('Rendering', () => {
    it('should render the login form with all elements', () => {
      render(<LoginForm />)

      expect(screen.getByRole('heading', { name: /bienvenido de vuelta/i })).toBeInTheDocument()
      expect(screen.getByText(/ingresa tu correo electrónico y contraseña para acceder/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /^continuar$/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /continuar con google/i })).toBeInTheDocument()
    })

    it('should render forgot password link', () => {
      render(<LoginForm />)
      expect(screen.getByText(/¿olvidaste tu contraseña\?/i)).toBeInTheDocument()
    })

    it('should render sign up link', () => {
      render(<LoginForm />)
      expect(screen.getByText(/¿no tienes una cuenta\?/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /regístrate/i })).toHaveAttribute('href', '/signup')
    })
  })

  describe('Email/Password Login', () => {
    it('should handle successful email login', async () => {
      const user = userEvent.setup()
      const mockUser = { uid: '123', email: 'test@test.com' }
      mockSafeAsync.mockResolvedValue([mockUser, null])

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /^continuar$/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockLoginWithEmail).toHaveBeenCalledWith('test@test.com', 'password123')
      })
    })

    it('should display error message on failed login', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Invalid credentials'
      mockSafeAsync.mockResolvedValue([null, { message: errorMessage }])

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /^continuar$/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'wrongpassword')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('should disable inputs and show loading state during submission', async () => {
      const user = userEvent.setup()
      mockSafeAsync.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([null, null]), 100)))

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /^continuar$/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.click(submitButton)

      expect(screen.getByRole('button', { name: /iniciando sesión.../i })).toBeInTheDocument()
      expect(emailInput).toBeDisabled()
      expect(passwordInput).toBeDisabled()
    })

    it('should require email and password fields', () => {
      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)

      expect(emailInput).toBeRequired()
      expect(passwordInput).toBeRequired()
    })
  })

  describe('Google Login', () => {
    it('should handle successful Google login', async () => {
      const user = userEvent.setup()
      const mockUser = { uid: '123', email: 'test@gmail.com' }
      mockSafeAsync.mockResolvedValue([mockUser, null])

      render(<LoginForm />)

      const googleButton = screen.getByRole('button', { name: /continuar con google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(mockLoginWithGoogle).toHaveBeenCalled()
      })
    })

    it('should display error message on failed Google login', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Google login failed'
      mockSafeAsync.mockResolvedValue([null, { message: errorMessage }])

      render(<LoginForm />)

      const googleButton = screen.getByRole('button', { name: /continuar con google/i })
      await user.click(googleButton)

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument()
      })
    })

    it('should disable all buttons during Google login', async () => {
      const user = userEvent.setup()
      mockSafeAsync.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve([null, null]), 100)))

      render(<LoginForm />)

      const googleButton = screen.getByRole('button', { name: /continuar con google/i })
      await user.click(googleButton)

      const submitButton = screen.getByRole('button', { name: /iniciando sesión.../i })
      expect(submitButton).toBeDisabled()
      expect(googleButton).toBeDisabled()
    })
  })

  describe('Form Validation', () => {
    it('should have email input with correct type', () => {
      render(<LoginForm />)
      const emailInput = screen.getByLabelText(/correo electrónico/i)
      expect(emailInput).toHaveAttribute('type', 'email')
    })

    it('should have password input with correct type', () => {
      render(<LoginForm />)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })

    it('should clear error message on new submission', async () => {
      const user = userEvent.setup()
      mockSafeAsync
        .mockResolvedValueOnce([null, { message: 'First error' }])
        .mockResolvedValueOnce([{ uid: '123' }, null])

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /^continuar$/i })

      // First submission with error
      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'wrong')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument()
      })

      // Clear and try again
      await user.clear(passwordInput)
      await user.type(passwordInput, 'correct')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper labels for form inputs', () => {
      render(<LoginForm />)
      
      expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
    })

    it('should display error in an accessible way', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Invalid credentials'
      mockSafeAsync.mockResolvedValue([null, { message: errorMessage }])

      render(<LoginForm />)

      const emailInput = screen.getByLabelText(/correo electrónico/i)
      const passwordInput = screen.getByLabelText(/contraseña/i)
      const submitButton = screen.getByRole('button', { name: /^continuar$/i })

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'wrong')
      await user.click(submitButton)

      await waitFor(() => {
        const errorDiv = screen.getByText(errorMessage)
        expect(errorDiv).toBeInTheDocument()
        expect(errorDiv).toHaveClass('text-red-400')
      })
    })
  })
})
