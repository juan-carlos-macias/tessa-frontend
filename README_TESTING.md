# Testing Guide for Tessa Frontend

This project uses **Jest + React Testing Library** for unit/integration tests and **Playwright** for E2E tests.

## 🚀 Quick Start

### Install Playwright Browsers (First Time Only)
```bash
npm run playwright:install
```

### Run Tests
```bash
# Unit tests
npm test

# Unit tests (watch mode)
npm run test:watch

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests (UI mode)
npm run test:e2e:ui

# All tests
npm run test:all
```

## 📋 Testing Tools Overview

### Jest + React Testing Library
**Best for:** Component tests, user interactions, form validation

**Coverage:**
- ✅ LoginForm: 21 tests covering rendering, validation, error handling, accessibility
- ✅ SignupForm: 18 tests covering password matching, form states, Google auth

### Playwright
**Best for:** Full user flows, cross-browser testing, mobile testing

**Coverage:**
- ✅ Login Flow: 12 tests (desktop + mobile views)
- ✅ Signup Flow: 18 tests (desktop + mobile + accessibility)

## 📁 Test Structure

```
src/
  components/form/
    LoginForm.tsx
    SignupForm.tsx
    __tests__/
      LoginForm.test.tsx
      SignupForm.test.tsx
  __tests__/utils/
    test-utils.tsx

e2e/
  login.spec.ts
  signup.spec.ts

jest.config.js
jest.setup.js
playwright.config.ts
```

## 📝 Test Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run all unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate coverage report |

## ✍️ Writing Tests

### Unit Test Example
```typescript
import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import userEvent from '@testing-library/user-event'
import { LoginForm } from '../LoginForm'

it('should handle user login', async () => {
  const user = userEvent.setup()
  render(<LoginForm />)
  
  await user.type(screen.getByLabelText(/email/i), 'test@test.com')
  await user.type(screen.getByLabelText(/password/i), 'password123')
  await user.click(screen.getByRole('button', { name: /continuar/i }))
  
  await waitFor(() => {
    expect(mockLoginFunction).toHaveBeenCalled()
  })
})
```

### E2E Test Example
```typescript
import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('/login')
  
  await page.getByLabel(/correo electrónico/i).fill('test@test.com')
  await page.getByLabel(/contraseña/i).fill('password123')
  await page.getByRole('button', { name: /continuar/i }).click()
  
  await expect(page).toHaveURL('/dashboard')
})
```

## 🎯 Best Practices

1. **Test user behavior, not implementation**
   - Use semantic queries (getByRole, getByLabel)
   - Test from the user's perspective

2. **Keep tests maintainable**
   - Use shared test utilities
   - Mock external dependencies (Firebase)
   - Avoid testing internal state

3. **Focus on critical paths**
   - Login/logout flows
   - Form validation
   - Error handling
   - Accessibility

## 🔧 Troubleshooting

### TypeScript Errors with jest-dom
Ensure `jest-setup.d.ts` exists with:
```typescript
import '@testing-library/jest-dom'
```

### Playwright Browser Not Found
```bash
npm run playwright:install
```

### Test Timeout
Increase timeout in playwright.config.ts or specific test:
```typescript
test('long test', async ({ page }) => {
  test.setTimeout(60000) // 60 seconds
})
```

## 📊 Coverage Goals

- Statements: > 80%
- Branches: > 75%
- Functions: > 80%
- Lines: > 80%

View coverage: `open coverage/lcov-report/index.html`

## 🔗 Resources

- [Jest Docs](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Docs](https://playwright.dev/)
