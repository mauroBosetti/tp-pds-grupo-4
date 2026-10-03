import { test, expect } from '@playwright/test'

test.describe('Pantalla de Autenticación de Usuarios (Cliente y Agencia)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('muestra por defecto el formulario de login para cliente', async ({ page }) => {
    await expect(page.getByText(/ingresar como cliente/i)).toBeVisible()
    await expect(page.getByLabel(/^email$/i)).toBeVisible()
    await expect(page.getByLabel(/^contraseña$/i)).toBeVisible()
    await expect(page.getByLabel(/nombre/i)).not.toBeVisible()
    await expect(page.getByLabel(/código de grupo/i)).not.toBeVisible()
    await expect(page.getByRole('button', { name: /^ingresar$/i })).toBeDisabled()
  })

  test('permite cambiar a la pestaña de agencia en modo login', async ({ page }) => {
    await page.getByRole('tab', { name: /^agencia$/i }).click()

    await expect(page.getByText(/ingresar como agencia/i)).toBeVisible()
    await expect(page.getByLabel(/^email$/i)).toBeVisible()
    await expect(page.getByLabel(/^contraseña$/i)).toBeVisible()
    await expect(page.getByLabel(/código de grupo/i)).not.toBeVisible()
  })

  test('en agencia al alternar a registro muestra código de grupo', async ({ page }) => {
    await page.getByRole('tab', { name: /^agencia$/i }).click()
    await page.getByRole('tab', { name: /^registrarse$/i }).click()

    await expect(page.getByText(/registro de agencia/i)).toBeVisible()
    await expect(page.getByLabel(/nombre/i)).toBeVisible()
    await expect(page.getByLabel(/^email$/i)).toBeVisible()
    await expect(page.getByLabel(/^contraseña$/i)).toBeVisible()
    await expect(page.getByLabel(/código de grupo/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeDisabled()
  })

  test('en cliente al alternar a registro NO muestra código de grupo', async ({ page }) => {
    await page.getByRole('tab', { name: /^cliente$/i }).click()
    await page.getByRole('tab', { name: /^registrarse$/i }).click()

    await expect(page.getByText(/registro de cliente/i)).toBeVisible()
    await expect(page.getByLabel(/nombre/i)).toBeVisible()
    await expect(page.getByLabel(/^email$/i)).toBeVisible()
    await expect(page.getByLabel(/^contraseña$/i)).toBeVisible()
    await expect(page.getByLabel(/código de grupo/i)).not.toBeVisible()
  })

  test('navegar a /registro redirige a /login con modo registro activo', async ({ page }) => {
    await page.goto('/registro')
    await expect(page).toHaveURL(/login\?modo=registro/)
    await expect(page.getByText(/registro de cliente/i)).toBeVisible()
  })

  test('permite alternar entre login y registro mediante el enlace inferior', async ({ page }) => {
    await page.getByRole('button', { name: /registrate/i }).click()
    await expect(page.getByText(/registro de cliente/i)).toBeVisible()

    await page.getByRole('button', { name: /ingresá/i }).click()
    await expect(page.getByText(/ingresar como cliente/i)).toBeVisible()
  })

  test('registro exitoso de cliente inicia sesión y redirige a /catalogo', async ({ page }) => {
    await page.route('**/api/auth/cliente/registro', async (route) => {
      await route.fulfill({ status: 201, json: { id: 'cli-1', nombre: 'Carlos' } })
    })
    await page.route('**/api/auth/cliente/login', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          token: 'jwt-cliente',
          usuario: { nombre: 'Carlos', email: 'carlos@cliente.com', rol: 'cliente' },
        },
      })
    })

    await page.getByRole('tab', { name: /^registrarse$/i }).click()
    await page.getByLabel(/nombre/i).fill('Carlos')
    await page.getByLabel(/^email$/i).fill('carlos@cliente.com')
    await page.getByLabel(/^contraseña$/i).fill('clave123')

    await page.getByRole('button', { name: /crear cuenta/i }).click()

    await expect(page).toHaveURL(/\/catalogo$/)
    await expect(page.getByText(/hola, carlos/i)).toBeVisible()
  })

  test('login de agencia redirige a /agencia', async ({ page }) => {
    await page.route('**/api/auth/agencia/login', async (route) => {
      await route.fulfill({
        status: 200,
        json: {
          token: 'jwt-agencia',
          usuario: { nombre: 'Viajes Sur', email: 'sur@agencia.com', rol: 'agencia' },
        },
      })
    })

    await page.getByRole('tab', { name: /^agencia$/i }).click()
    await page.getByLabel(/^email$/i).fill('sur@agencia.com')
    await page.getByLabel(/^contraseña$/i).fill('secreta')

    await page.getByRole('button', { name: /^ingresar$/i }).click()

    await expect(page).toHaveURL(/\/agencia$/)
  })

  test('muestra error de credenciales inválidas ante 401', async ({ page }) => {
    await page.route('**/api/auth/cliente/login', async (route) => {
      await route.fulfill({ status: 401, json: { error: 'Email o contraseña incorrectos' } })
    })

    await page.getByLabel(/^email$/i).fill('carlos@cliente.com')
    await page.getByLabel(/^contraseña$/i).fill('incorrecta')

    await page.getByRole('button', { name: /^ingresar$/i }).click()

    await expect(page.getByRole('alert')).toHaveText(/email o contraseña incorrectos/i)
  })
})
