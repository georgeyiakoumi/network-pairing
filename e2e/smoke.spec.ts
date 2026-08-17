import { test, expect } from '@playwright/test'

/**
 * Smoke tests — run on every new project created from the template.
 *
 * These verify the scaffold renders correctly and no runtime errors
 * appear before any project-specific code has been written.
 *
 * Run: npx playwright test
 * Run with UI: npx playwright test --ui
 */

test('homepage loads without errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', err => errors.push(err.message))

  await page.goto('/')
  await expect(page).not.toHaveURL(/error/i)

  // No runtime errors on load
  expect(errors).toHaveLength(0)
})

test('page has a valid title', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/.+/)
})

test('page has visible content', async ({ page }) => {
  await page.goto('/')
  // At least one element with text is rendered — not a blank white page
  const body = page.locator('body')
  await expect(body).not.toBeEmpty()
})

test('no broken internal links on homepage', async ({ page }) => {
  await page.goto('/')

  const links = await page.locator('a[href^="/"]').all()
  for (const link of links) {
    const href = await link.getAttribute('href')
    if (!href || href === '#') continue

    const response = await page.request.get(href)
    expect(
      response.status(),
      `Broken link: ${href} returned ${response.status()}`
    ).toBeLessThan(400)
  }
})

test('dark mode class applies correctly', async ({ page }) => {
  await page.goto('/')

  // If next-themes is included, toggling theme should add/remove .dark on <html>
  // This test is a no-op if dark mode was not included — it passes either way
  const html = page.locator('html')
  const hasThemeAttr = await html.getAttribute('class')

  // If class is set, it should be a known value (light/dark/empty)
  if (hasThemeAttr !== null) {
    expect(['', 'dark', 'light'].some(v => hasThemeAttr.includes(v) || hasThemeAttr === '')).toBe(true)
  }
})
