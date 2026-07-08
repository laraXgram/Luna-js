import { expect, test } from '@playwright/test'
import { pageLoads } from './support'

test.describe('error modal', () => {
  test.beforeEach(async ({ page }) => {
    pageLoads.watch(page)
    await page.goto('/error-modal')
  })

  test('uses the dialog element', async ({ page }) => {
    await page.getByText('Invalid Visit', { exact: true }).click()

    await expect(page.locator('dialog#luna-error-dialog > iframe')).toBeVisible()
  })

  test('displays the modal containing the response as HTML when an invalid Luna response comes back', async ({
    page,
  }) => {
    await page.getByText('Invalid Visit', { exact: true }).click()
    await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeVisible()
    await expect(page.frameLocator('iframe').locator('body')).toContainText(
      'This is a page that does not have the Luna app loaded.',
    )
  })

  test('displays the modal with a helpful message when a regular JSON response comes back instead of an Luna response', async ({
    page,
  }) => {
    await page.getByText('Invalid Visit (JSON response)').click()
    await expect(page.frameLocator('iframe').locator('body')).toContainText(
      'All Luna requests must receive a valid Luna response, however a plain JSON response was received.',
    )
    await page.frameLocator('iframe').getByText('All Luna requests must').click()
    await expect(page.frameLocator('iframe').locator('body')).toContainText('{"foo":"bar"}')
  })

  test('can close the modal using the escape key', async ({ page }) => {
    await page.getByText('Invalid Visit', { exact: true }).click()
    await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeVisible()
    await page.locator('body').press('Escape')
    await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeHidden()
  })

  test('closes the modal when clicking outside of it', async ({ page }) => {
    await page.getByText('Invalid Visit', { exact: true }).click()
    await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeVisible()
    await page.mouse.click(25, 25)
    await expect(page.frameLocator('iframe').getByText('This is a page that does not')).toBeHidden()
  })

  test('it does not execute scripts in the error dialog iframe', async ({ page }) => {
    await page.getByText('Invalid Visit (XSS)', { exact: true }).click()
    await expect(page.locator('dialog#luna-error-dialog > iframe')).toBeVisible()
    const xssExecuted = await page.evaluate(() => (window as any).xssExecuted)
    expect(xssExecuted).toBeUndefined()
  })

  test('does not set a nonce on the dialog style tag by default', async ({ page }) => {
    await page.getByText('Invalid Visit', { exact: true }).click()
    await expect(page.locator('dialog#luna-error-dialog')).toBeVisible()

    const nonce = await page.evaluate(() => {
      const style = Array.from(document.head.querySelectorAll('style')).find((el) =>
        el.textContent?.includes('luna-error-dialog'),
      )
      return style?.nonce ?? null
    })

    await expect(nonce).toBe('')
  })
})

test('applies the configured nonce to the injected dialog style tag', async ({ page }) => {
  pageLoads.watch(page)
  await page.goto('/error-modal?nonce')

  await page.getByText('Invalid Visit', { exact: true }).click()
  await expect(page.locator('dialog#luna-error-dialog')).toBeVisible()

  const nonce = await page.evaluate(() => {
    const style = Array.from(document.head.querySelectorAll('style')).find((el) =>
      el.textContent?.includes('luna-error-dialog'),
    )
    return style?.nonce ?? null
  })

  await expect(nonce).toBe('test-nonce')
})
