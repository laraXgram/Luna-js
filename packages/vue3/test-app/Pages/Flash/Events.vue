<script setup lang="ts">
import { router, usePage } from '@lunajs/vue3'

declare global {
  interface Window {
    messages: unknown[]
  }
}

const page = usePage()

window.messages = []

const internalAlert = (...args: unknown[]) => {
  window.messages.push(...args)
}

const visitWithFlash = () => {
  router.on('flash', (event) => {
    internalAlert('Luna.on(flash)')
    internalAlert(event.detail.flash)
  })

  document.addEventListener('luna:flash', (event) => {
    internalAlert('addEventListener(luna:flash)')
    internalAlert((event as CustomEvent).detail.flash)
  })

  router.post(
    '/flash/events/with-data',
    {},
    {
      onFlash: (flash) => {
        internalAlert('onFlash')
        internalAlert(flash)
      },
      onSuccess: (page) => {
        internalAlert('onSuccess')
        internalAlert(page.flash)
      },
    },
  )
}

const visitWithErrorsAndFlash = () => {
  router.on('flash', (event) => {
    internalAlert('Luna.on(flash)')
    internalAlert(event.detail.flash)
  })

  router.post(
    '/flash/events/with-errors',
    {},
    {
      onFlash: (flash) => {
        internalAlert('onFlash')
        internalAlert(flash)
      },
      onError: (errors) => {
        internalAlert('onError')
        internalAlert(errors)
      },
    },
  )
}

const visitWithoutFlash = () => {
  router.on('flash', () => {
    internalAlert('Luna.on(flash)')
  })

  document.addEventListener('luna:flash', () => {
    internalAlert('addEventListener(luna:flash)')
  })

  router.post(
    '/flash/events/without-data',
    {},
    {
      onFlash: () => {
        internalAlert('onFlash')
      },
      onSuccess: () => {
        internalAlert('onSuccess')
      },
    },
  )
}

const navigateAway = () => {
  router.get('/')
}
</script>

<template>
  <div>
    <span id="flash">{{ JSON.stringify(page.flash) }}</span>

    <a href="#" @click.prevent="visitWithFlash" class="with-flash">Visit with flash</a>
    <a href="#" @click.prevent="visitWithErrorsAndFlash" class="with-errors-and-flash">Visit with errors and flash</a>
    <a href="#" @click.prevent="visitWithoutFlash" class="without-flash">Visit without flash</a>
    <a href="#" @click.prevent="navigateAway" class="navigate-away">Navigate away</a>
  </div>
</template>
