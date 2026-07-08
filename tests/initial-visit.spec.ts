import { expect, test } from '@playwright/test'
import { requests } from './support'

test('it does not trigger unnecessary reload when history state has no Luna data', async ({ page }) => {
  await page.goto('/navigate-non-luna')
  await expect(page.getByText('Navigate Non-Luna')).toBeVisible()

  await page.click('a[href="/non-luna"]')
  await expect(page.locator('body')).toContainText('This is a page that does not have the Luna app loaded')

  requests.listen(page)

  await page.goBack()
  await page.waitForURL('/navigate-non-luna')
  await expect(page.getByText('Navigate Non-Luna')).toBeVisible()

  const pageRequests = requests.requests.filter((r) => r.url().includes('/navigate-non-luna'))
  expect(pageRequests.length).toBe(1)
})

test('it handles back/forward navigation between Luna and non-Luna pages correctly', async ({ page }) => {
  await page.goto('/non-luna')
  await expect(page.locator('body')).toContainText('This is a page that does not have the Luna app loaded')

  await page.click('a[href="/navigate-non-luna"]')
  await expect(page.getByText('Navigate Non-Luna')).toBeVisible()

  await page.click('a[href="/non-luna"]')
  await expect(page.locator('body')).toContainText('This is a page that does not have the Luna app loaded')

  requests.listen(page)

  await page.goBack()
  await page.waitForURL('/navigate-non-luna')
  await expect(page.getByText('Navigate Non-Luna')).toBeVisible()

  await page.goBack()
  await page.waitForURL('/non-luna')
  await expect(page.locator('body')).toContainText('This is a page that does not have the Luna app loaded')

  await page.goForward()
  await page.waitForURL('/navigate-non-luna')
  await expect(page.getByText('Navigate Non-Luna')).toBeVisible()

  const lunaRequests = requests.requests.filter(
    (r) => r.url().includes('/navigate-non-luna') && r.headers()['x-luna'] === 'true',
  )
  expect(lunaRequests.length).toBe(0)
})
