import { expect, Page, test } from '@playwright/test'
import { pageLoads } from './support'

async function getLunaHeadHTML(page: Page) {
  return await page.evaluate(() => {
    const lunaElements = Array.from(document.querySelector('head').querySelectorAll('[data-luna]'))

    return lunaElements.map((el) => el.outerHTML).join('')
  })
}

test.describe('Head component', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(process.env.PACKAGE === 'svelte', 'Svelte adapter has no Head component')
  })

  test('replaces the original title element', async ({ page }) => {
    await page.goto('/head')
    await page.waitForSelector('title[data-luna]', { state: 'attached' })

    const titles = await page.evaluate(() => {
      const allTitles = Array.from(document.querySelectorAll('title'))
      return {
        total: allTitles.length,
        lunaTitle: allTitles.find((t) => t.hasAttribute('data-luna'))?.textContent,
        allHaveLunaAttribute: allTitles.every((t) => t.hasAttribute('data-luna')),
      }
    })

    expect(titles.total).toBe(1)
    expect(titles.lunaTitle).toBe('Test Head Component')
    expect(titles.allHaveLunaAttribute).toBe(true)
  })

  test('replaces a plain title element without data-luna attribute', async ({ page }) => {
    await page.goto('/head/plain-title')
    await page.waitForSelector('title[data-luna]', { state: 'attached' })

    const titles = await page.evaluate(() => {
      const allTitles = Array.from(document.querySelectorAll('title'))
      return {
        total: allTitles.length,
        lunaTitle: allTitles.find((t) => t.hasAttribute('data-luna'))?.textContent,
      }
    })

    expect(titles.total).toBe(1)
    expect(titles.lunaTitle).toBe('Test Head Component')
  })

  test('renders the title tag and children with proper escaping', async ({ page }) => {
    await page.goto('/head')
    await page.waitForSelector('title[data-luna]', { state: 'attached' })

    const headHTML = await getLunaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="viewport" content="width=device-width, initial-scale=1" data-luna="">' +
        '<meta name="description" content="This is an &quot;escape&quot; example" data-luna="">' +
        '<meta name="undefined" content="undefined" data-luna="">' +
        '<meta name="number" content="0" data-luna="">' +
        '<meta name="boolean" content="true" data-luna="">' +
        '<meta name="false" content="false" data-luna="">' +
        '<meta name="null" content="null" data-luna="">' +
        '<meta name="float" content="3.14" data-luna="">' +
        '<meta name="xss" content="&lt;script&gt;alert(\'xss\')&lt;/script&gt;" data-luna="">' +
        '<meta name="ampersand" content="LaraGram &amp; Luna" data-luna="">' +
        '<meta name="unicode" content="Hélló! 🎉" data-luna="">' +
        '<title data-luna="">Test Head Component</title>',
    )
  })

  test('dynamically updates head elements', async ({ page }) => {
    await page.goto('/head/reactive')
    await page.waitForSelector('title[data-luna]', { state: 'attached' })

    let headHTML = await getLunaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="author" content="Test Author" data-luna="">' +
        '<meta name="description" content="Initial description" data-luna="description">' +
        '<title data-luna="">Initial Title</title>',
    )

    await page.click('#update-meta')
    await page.waitForTimeout(100)

    headHTML = await getLunaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="author" content="Test Author" data-luna="">' +
        '<meta name="description" content="Updated description" data-luna="description">' +
        '<title data-luna="">Updated Title</title>',
    )
  })

  test('renders multiple different head element tags', async ({ page }) => {
    await page.goto('/head/mixed')
    await page.waitForSelector('title[data-luna]', { state: 'attached' })

    const headHTML = await getLunaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta charset="utf-8" data-luna="">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1" data-luna="">' +
        '<meta name="description" content="Testing multiple head elements" data-luna="">' +
        '<meta name="keywords" content="test, vue, luna" data-luna="">' +
        '<meta property="og:title" content="Open Graph Title" data-luna="">' +
        '<meta property="og:description" content="Open Graph Description" data-luna="">' +
        '<link rel="icon" href="/favicon.ico" data-luna="">' +
        '<link rel="stylesheet" href="/custom.css" data-luna="">' +
        '<link rel="canonical" href="https://example.com/page" data-luna="">' +
        '<title data-luna="">Multiple Elements Test</title>',
    )
  })

  test('handles conditional rendering', async ({ page }) => {
    await page.goto('/head/conditional')
    await page.waitForSelector('title[data-luna]', { state: 'attached' })

    let headHTML = await getLunaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="always-present" content="This is always here" data-luna="">' +
        '<meta name="description" content="This description is conditionally rendered" data-luna="description">' +
        '<title data-luna="">Conditional Rendering</title>',
    )

    await page.click('#toggle-description')
    await page.waitForTimeout(100)
    headHTML = await getLunaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="always-present" content="This is always here" data-luna="">' +
        '<title data-luna="">Conditional Rendering</title>',
    )

    await page.click('#toggle-keywords')
    await page.waitForTimeout(100)
    headHTML = await getLunaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="always-present" content="This is always here" data-luna="">' +
        '<title data-luna="">Conditional Rendering</title>' +
        '<meta name="keywords" content="vue, test, conditional" data-luna="keywords">',
    )

    await page.click('#toggle-description')
    await page.waitForTimeout(100)
    headHTML = await getLunaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="always-present" content="This is always here" data-luna="">' +
        '<title data-luna="">Conditional Rendering</title>' +
        '<meta name="keywords" content="vue, test, conditional" data-luna="keywords">' +
        '<meta name="description" content="This description is conditionally rendered" data-luna="description">',
    )
  })

  test('passes page as second argument to titleCallback', async ({ page }) => {
    await page.goto('/head/title-callback?withTitleCallback')
    await page.waitForSelector('title[data-luna]', { state: 'attached' })

    const title = await page.evaluate(() => document.querySelector('title[data-luna]')?.textContent)
    expect(title).toBe('Callback Page | Account')
  })

  test('titleCallback receives the updated page after a client-side visit', async ({ page }) => {
    pageLoads.watch(page)

    await page.goto('/head/title-callback?withTitleCallback')
    await page.waitForSelector('title[data-luna]', { state: 'attached' })

    await expect(page).toHaveTitle('Callback Page | Account')

    await page.getByRole('link', { name: 'Go to reactive' }).click()

    await expect(page).toHaveTitle('Initial Title | Dashboard')
  })

  test('titleCallback re-runs when a prop is replaced client-side', async ({ page }) => {
    pageLoads.watch(page)

    await page.goto('/head/title-callback?withTitleCallback')
    await page.waitForSelector('title[data-luna]', { state: 'attached' })

    await expect(page).toHaveTitle('Callback Page | Account')

    await page.getByRole('button', { name: 'Replace prop' }).click()

    await expect(page).toHaveTitle('Callback Page | replaced')
  })

  test('handles head without title prop', async ({ page }) => {
    await page.goto('/head/without-title')
    await page.waitForTimeout(100)

    const headHTML = await getLunaHeadHTML(page)
    expect(headHTML).toBe('<meta name="test" content="no title provided" data-luna="">')
  })

  test('handles head with title prop', async ({ page }) => {
    await page.goto('/head/with-title')
    await page.waitForSelector('title[data-luna]', { state: 'attached' })

    const headHTML = await getLunaHeadHTML(page)
    expect(headHTML).toBe(
      '<meta name="description" content="Title set via children, not prop" data-luna="">' +
        '<title data-luna="">Title from Children</title>',
    )
  })

  test('preserves head-key for proper updates', async ({ page }) => {
    await page.goto('/head/reactive')
    await page.waitForSelector('title[data-luna]', { state: 'attached' })

    const descriptionLunaAttr = await page.locator('meta[name="description"]').getAttribute('data-luna')
    await expect(descriptionLunaAttr).toBe('description')

    await page.click('#update-meta')
    await page.waitForTimeout(100)

    const descriptionCount = await page.locator('meta[name="description"]').count()
    await expect(descriptionCount).toBe(1)
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Updated description')
  })

  test('does not duplicate meta tags on navigation', async ({ page }) => {
    await page.goto('/head/mixed')
    await page.waitForSelector('title[data-luna]', { state: 'attached' })

    await page.click('#navigate-away')
    await page.waitForFunction(() => document.querySelector('title[data-luna]')?.textContent === 'Home')

    await page.click('#navigate-back')
    await page.waitForFunction(
      () => document.querySelector('title[data-luna]')?.textContent === 'Multiple Elements Test',
    )

    const expectedMixedContent =
      '<meta charset="utf-8" data-luna="">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1" data-luna="">' +
      '<meta name="description" content="Testing multiple head elements" data-luna="">' +
      '<meta name="keywords" content="test, vue, luna" data-luna="">' +
      '<meta property="og:title" content="Open Graph Title" data-luna="">' +
      '<meta property="og:description" content="Open Graph Description" data-luna="">' +
      '<link rel="icon" href="/favicon.ico" data-luna="">' +
      '<link rel="stylesheet" href="/custom.css" data-luna="">' +
      '<link rel="canonical" href="https://example.com/page" data-luna="">' +
      '<title data-luna="">Multiple Elements Test</title>'

    const headHTML = await getLunaHeadHTML(page)
    expect(headHTML).toBe(expectedMixedContent)

    await page.goBack()
    await page.waitForSelector('title[data-luna]', { state: 'attached' })
    const homeTitle = await page.evaluate(() => document.querySelector('title[data-luna]')?.textContent)
    expect(homeTitle).toBe('Home')

    await page.goBack()
    await page.waitForSelector('title[data-luna]', { state: 'attached' })
    const backToMixedHTML = await getLunaHeadHTML(page)
    expect(backToMixedHTML).toBe(expectedMixedContent)
  })
})
