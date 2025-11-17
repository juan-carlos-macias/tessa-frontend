import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock Firebase Auth functions
export const mockFirebaseAuth = {
  loginWithEmail: jest.fn(),
  loginWithGoogle: jest.fn(),
  signupWithEmail: jest.fn(),
}

// Custom render function that includes providers if needed
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return render(ui, { ...options })
}

export * from '@testing-library/react'
export { customRender as render }
