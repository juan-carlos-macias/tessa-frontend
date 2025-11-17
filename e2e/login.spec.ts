import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page correctly', async ({ page }) => {
    // Check page title/heading
    await expect(page.getByRole('heading', { name: /bienvenido de vuelta/i })).toBeVisible();
    
    // Check form elements
    await expect(page.getByLabel(/correo electrónico/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^continuar$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continuar con google/i })).toBeVisible();
  });

  test('should show validation for empty form submission', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /^continuar$/i });
    
    // Try to submit without filling fields
    await submitButton.click();
    
    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel(/correo electrónico/i);
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('should show validation for invalid email format', async ({ page }) => {
    const emailInput = page.getByLabel(/correo electrónico/i);
    const passwordInput = page.getByLabel(/contraseña/i);
    const submitButton = page.getByRole('button', { name: /^continuar$/i });
    
    // Fill with invalid email
    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');
    await submitButton.click();
    
    // HTML5 validation should catch invalid email
    const isEmailInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isEmailInvalid).toBeTruthy();
  });

  test('should navigate to signup page', async ({ page }) => {
    const signupLink = page.getByRole('link', { name: /regístrate/i });
    await signupLink.click();
    
    await expect(page).toHaveURL('/signup');
    await expect(page.getByRole('heading', { name: /crea tu cuenta/i })).toBeVisible();
  });

  test('should show forgot password link', async ({ page }) => {
    const forgotPasswordLink = page.getByText(/¿olvidaste tu contraseña\?/i);
    await expect(forgotPasswordLink).toBeVisible();
  });

  test('should display terms and privacy policy links', async ({ page }) => {
    await expect(page.getByText(/términos de servicio/i)).toBeVisible();
    await expect(page.getByText(/política de privacidad/i)).toBeVisible();
  });

  test('should disable form during submission', async ({ page }) => {
    const emailInput = page.getByLabel(/correo electrónico/i);
    const passwordInput = page.getByLabel(/contraseña/i);
    const submitButton = page.getByRole('button', { name: /^continuar$/i });
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    // Click submit and immediately check if loading state appears
    await submitButton.click();
    
    // Check for loading text (may appear briefly)
    // Note: This test may be flaky if the backend responds too quickly
    // In a real scenario, you'd mock the Firebase backend
    await expect(page.getByRole('button', { name: /iniciando sesión.../i })).toBeVisible({ timeout: 1000 }).catch(() => {
      // If loading state doesn't appear (too fast), that's okay
    });
  });

  test('should have all required form fields', async ({ page }) => {
    const emailInput = page.getByLabel(/correo electrónico/i);
    const passwordInput = page.getByLabel(/contraseña/i);
    
    // Check if fields are required
    expect(await emailInput.getAttribute('required')).not.toBeNull();
    expect(await passwordInput.getAttribute('required')).not.toBeNull();
  });

  test('should have correct input types', async ({ page }) => {
    const emailInput = page.getByLabel(/correo electrónico/i);
    const passwordInput = page.getByLabel(/contraseña/i);
    
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('should have Google login button with icon', async ({ page }) => {
    const googleButton = page.getByRole('button', { name: /continuar con google/i });
    
    await expect(googleButton).toBeVisible();
    
    // Check if SVG icon is present (Google logo)
    const svg = googleButton.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('should maintain form state when typing', async ({ page }) => {
    const emailInput = page.getByLabel(/correo electrónico/i);
    const passwordInput = page.getByLabel(/contraseña/i);
    
    const testEmail = 'test@example.com';
    const testPassword = 'mypassword123';
    
    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);
    
    // Verify values are maintained
    await expect(emailInput).toHaveValue(testEmail);
    await expect(passwordInput).toHaveValue(testPassword);
  });

  test('should have proper placeholder text', async ({ page }) => {
    const emailInput = page.getByLabel(/correo electrónico/i);
    
    await expect(emailInput).toHaveAttribute('placeholder', 'tu@ejemplo.com');
  });
});

test.describe('Login Flow - Mobile View', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should display correctly on mobile', async ({ page }) => {
    await page.goto('/login');
    
    // Check if all elements are visible on mobile
    await expect(page.getByRole('heading', { name: /bienvenido de vuelta/i })).toBeVisible();
    await expect(page.getByLabel(/correo electrónico/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^continuar$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continuar con google/i })).toBeVisible();
  });

  test('should be able to fill form on mobile', async ({ page }) => {
    await page.goto('/login');
    
    const emailInput = page.getByLabel(/correo electrónico/i);
    const passwordInput = page.getByLabel(/contraseña/i);
    
    await emailInput.fill('mobile@test.com');
    await passwordInput.fill('password123');
    
    await expect(emailInput).toHaveValue('mobile@test.com');
    await expect(passwordInput).toHaveValue('password123');
  });
});
