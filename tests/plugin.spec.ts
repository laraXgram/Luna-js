import { expect, test } from '@playwright/test'

test.describe('plugin', () => {
  test.skip(process.env.PACKAGE !== 'vue3')

  test.describe('$page helper', () => {
    test('has the helper injected into the Vue component', async ({ page }) => {
      await page.goto('/')

      const initialPage = await page.evaluate(() => (window as any).initialPage)
      const $page = await page.evaluate(() => (window as any)._plugin_global_props.$page)
      await expect(initialPage).not.toBeNull()
      await expect($page).toMatchObject(initialPage)
    })

    test('misses the helper when not registered', async ({ page }) => {
      await page.goto('/plugin/without')

      const $page = await page.evaluate(() => (window as any)._plugin_global_props.$page)
      await expect($page).toBeUndefined()
    })
  })

  test.describe('$luna helper', () => {
    test('has the helper injected into the Vue component', async ({ page }) => {
      await page.goto('/')

      const $luna = await page.evaluate(() => (window as any)._plugin_global_props.$luna)
      const Luna = await page.evaluate(() => (window as any).testing.Luna)
      await expect($luna).not.toBeNull()
      await expect($luna).toEqual(Luna)
    })

    test('misses the helper when not registered', async ({ page }) => {
      await page.goto('/plugin/without')

      const $luna = await page.evaluate(() => (window as any)._plugin_global_props.$luna)
      await expect($luna).toBeUndefined()
    })
  })
})
