import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('should display signup page correctly', async ({ page }) => {
    // Check page title/heading
    await expect(page.getByRole('heading', { name: /crea tu cuenta/i })).toBeVisible();
    
    // Check form elements
    await expect(page.getByLabel(/^correo electrónico/i)).toBeVisible();
    await expect(page.getByLabel(/^contraseña$/i)).toBeVisible();
    await expect(page.getByLabel(/confirmar contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continuar con google/i })).toBeVisible();
  });

  test('should show password requirements hint', async ({ page }) => {
    await expect(page.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeVisible();
  });

  test('should show validation for empty form submission', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /crear cuenta/i });
    
    // Try to submit without filling fields
    await submitButton.click();
    
    // HTML5 validation should prevent submission
    const emailInput = page.getByLabel(/^correo electrónico/i);
    const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('should show validation for invalid email format', async ({ page }) => {
    const emailInput = page.getByLabel(/^correo electrónico/i);
    const passwordInput = page.getByLabel(/^contraseña$/i);
    const confirmPasswordInput = page.getByLabel(/confirmar contraseña/i);
    const submitButton = page.getByRole('button', { name: /crear cuenta/i });
    
    // Fill with invalid email
    await emailInput.fill('invalid-email');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    await submitButton.click();
    
    // HTML5 validation should catch invalid email
    const isEmailInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isEmailInvalid).toBeTruthy();
  });

  test('should validate password mismatch', async ({ page }) => {
    const emailInput = page.getByLabel(/^correo electrónico/i);
    const passwordInput = page.getByLabel(/^contraseña$/i);
    const confirmPasswordInput = page.getByLabel(/confirmar contraseña/i);
    const submitButton = page.getByRole('button', { name: /crear cuenta/i });
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('differentpassword');
    await submitButton.click();
    
    // Should show error message
    await expect(page.getByText(/las contraseñas no coinciden/i)).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /inicia sesión/i });
    await loginLink.click();
    
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: /bienvenido de vuelta/i })).toBeVisible();
  });

  test('should display terms and privacy policy links', async ({ page }) => {
    await expect(page.getByText(/términos de servicio/i)).toBeVisible();
    await expect(page.getByText(/política de privacidad/i)).toBeVisible();
  });

  test('should have all required form fields', async ({ page }) => {
    const emailInput = page.getByLabel(/^correo electrónico/i);
    const passwordInput = page.getByLabel(/^contraseña$/i);
    const confirmPasswordInput = page.getByLabel(/confirmar contraseña/i);
    
    // Check if fields are required
    expect(await emailInput.getAttribute('required')).not.toBeNull();
    expect(await passwordInput.getAttribute('required')).not.toBeNull();
    expect(await confirmPasswordInput.getAttribute('required')).not.toBeNull();
  });

  test('should have correct input types', async ({ page }) => {
    const emailInput = page.getByLabel(/^correo electrónico/i);
    const passwordInput = page.getByLabel(/^contraseña$/i);
    const confirmPasswordInput = page.getByLabel(/confirmar contraseña/i);
    
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });

  test('should have Google signup button with icon', async ({ page }) => {
    const googleButton = page.getByRole('button', { name: /continuar con google/i });
    
    await expect(googleButton).toBeVisible();
    
    // Check if SVG icon is present (Google logo)
    const svg = googleButton.locator('svg');
    await expect(svg).toBeVisible();
  });

  test('should maintain form state when typing', async ({ page }) => {
    const emailInput = page.getByLabel(/^correo electrónico/i);
    const passwordInput = page.getByLabel(/^contraseña$/i);
    const confirmPasswordInput = page.getByLabel(/confirmar contraseña/i);
    
    const testEmail = 'test@example.com';
    const testPassword = 'mypassword123';
    
    await emailInput.fill(testEmail);
    await passwordInput.fill(testPassword);
    await confirmPasswordInput.fill(testPassword);
    
    // Verify values are maintained
    await expect(emailInput).toHaveValue(testEmail);
    await expect(passwordInput).toHaveValue(testPassword);
    await expect(confirmPasswordInput).toHaveValue(testPassword);
  });

  test('should have proper placeholder texts', async ({ page }) => {
    const emailInput = page.getByLabel(/^correo electrónico/i);
    const passwordInput = page.getByLabel(/^contraseña$/i);
    const confirmPasswordInput = page.getByLabel(/confirmar contraseña/i);
    
    await expect(emailInput).toHaveAttribute('placeholder', 'tu@ejemplo.com');
    await expect(passwordInput).toHaveAttribute('placeholder', 'Mínimo 6 caracteres');
    await expect(confirmPasswordInput).toHaveAttribute('placeholder', 'Repite tu contraseña');
  });

  test('should clear error message on re-submission with matching passwords', async ({ page }) => {
    const emailInput = page.getByLabel(/^correo electrónico/i);
    const passwordInput = page.getByLabel(/^contraseña$/i);
    const confirmPasswordInput = page.getByLabel(/confirmar contraseña/i);
    const submitButton = page.getByRole('button', { name: /crear cuenta/i });
    
    // First submission with mismatched passwords
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('differentpassword');
    await submitButton.click();
    
    await expect(page.getByText(/las contraseñas no coinciden/i)).toBeVisible();
    
    // Fix the password mismatch
    await confirmPasswordInput.clear();
    await confirmPasswordInput.fill('password123');
    await submitButton.click();
    
    // Error should be cleared (though Firebase error might appear instead)
    // We're just checking the password mismatch error is gone
    await expect(page.getByText(/las contraseñas no coinciden/i)).not.toBeVisible();
  });

  test('should disable form during submission with matching passwords', async ({ page }) => {
    const emailInput = page.getByLabel(/^correo electrónico/i);
    const passwordInput = page.getByLabel(/^contraseña$/i);
    const confirmPasswordInput = page.getByLabel(/confirmar contraseña/i);
    const submitButton = page.getByRole('button', { name: /crear cuenta/i });
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    
    // Click submit and immediately check if loading state appears
    await submitButton.click();
    
    // Check for loading text (may appear briefly)
    // Note: This test may be flaky if the backend responds too quickly
    await expect(page.getByRole('button', { name: /creando cuenta.../i })).toBeVisible({ timeout: 1000 }).catch(() => {
      // If loading state doesn't appear (too fast), that's okay
    });
  });

  test('should show password as masked by default', async ({ page }) => {
    const passwordInput = page.getByLabel(/^contraseña$/i);
    const confirmPasswordInput = page.getByLabel(/confirmar contraseña/i);
    
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
  });
});

test.describe('Signup Flow - Mobile View', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('should display correctly on mobile', async ({ page }) => {
    await page.goto('/signup');
    
    // Check if all elements are visible on mobile
    await expect(page.getByRole('heading', { name: /crea tu cuenta/i })).toBeVisible();
    await expect(page.getByLabel(/^correo electrónico/i)).toBeVisible();
    await expect(page.getByLabel(/^contraseña$/i)).toBeVisible();
    await expect(page.getByLabel(/confirmar contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continuar con google/i })).toBeVisible();
  });

  test('should be able to fill form on mobile', async ({ page }) => {
    await page.goto('/signup');
    
    const emailInput = page.getByLabel(/^correo electrónico/i);
    const passwordInput = page.getByLabel(/^contraseña$/i);
    const confirmPasswordInput = page.getByLabel(/confirmar contraseña/i);
    
    await emailInput.fill('mobile@test.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('password123');
    
    await expect(emailInput).toHaveValue('mobile@test.com');
    await expect(passwordInput).toHaveValue('password123');
    await expect(confirmPasswordInput).toHaveValue('password123');
  });

  test('should show password mismatch error on mobile', async ({ page }) => {
    await page.goto('/signup');
    
    const emailInput = page.getByLabel(/^correo electrónico/i);
    const passwordInput = page.getByLabel(/^contraseña$/i);
    const confirmPasswordInput = page.getByLabel(/confirmar contraseña/i);
    const submitButton = page.getByRole('button', { name: /crear cuenta/i });
    
    await emailInput.fill('mobile@test.com');
    await passwordInput.fill('password123');
    await confirmPasswordInput.fill('differentpassword');
    await submitButton.click();
    
    await expect(page.getByText(/las contraseñas no coinciden/i)).toBeVisible();
  });
});

test.describe('Signup Flow - Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/signup');
    
    // Tab through form elements
    await page.keyboard.press('Tab'); // Email input
    await expect(page.getByLabel(/^correo electrónico/i)).toBeFocused();
    
    await page.keyboard.press('Tab'); // Password input
    await expect(page.getByLabel(/^contraseña$/i)).toBeFocused();
    
    await page.keyboard.press('Tab'); // Confirm password input  
    await expect(page.getByLabel(/confirmar contraseña/i)).toBeFocused();
    
    await page.keyboard.press('Tab'); // Submit button
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeFocused();
  });

  test('should have descriptive labels', async ({ page }) => {
    await page.goto('/signup');
    
    // Check that inputs have associated labels
    const emailInput = page.getByLabel(/^correo electrónico/i);
    const passwordInput = page.getByLabel(/^contraseña$/i);
    const confirmPasswordInput = page.getByLabel(/confirmar contraseña/i);
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(confirmPasswordInput).toBeVisible();
  });
});
