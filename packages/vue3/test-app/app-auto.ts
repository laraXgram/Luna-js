import { createLunaApp, router } from '@laraxgram/vue3'

window.testing = { Luna: router }

// This uses the pages shorthand - the Vite plugin transforms this to a full resolve function
// Using './VitePages' instead of './Pages' to prove the transform uses our configured path
createLunaApp({
  pages: './VitePages',
})
