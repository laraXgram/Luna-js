<script setup lang="ts">
import { Link, router, usePage } from '@lunajs/vue3'

declare global {
  interface Window {
    messages: unknown[]
  }
}

const payloadWithFile = {
  file: new File(['foobar'], 'example.bin'),
}

const page = usePage()

window.messages = []

const internalAlert = (...args: unknown[]) => {
  window.messages.push(...args)
}

const withoutEventListeners = () => {
  router.post(page.url, {})
}

const removeLunaListener = () => {
  const removeEventListener = router.on('before', () => internalAlert('Luna.on(before)'))

  internalAlert('Removing Luna.on Listener')
  removeEventListener()

  router.post(
    page.url,
    {},
    {
      onBefore: () => internalAlert('onBefore'),
      onStart: () => internalAlert('onStart'),
    },
  )
}

const onceLunaListener = () => {
  router.once('before', () => internalAlert('Luna.once(before)'))

  router.post(page.url, {}, { onBefore: () => internalAlert('onBefore-1') })
  router.post(page.url, {}, { onBefore: () => internalAlert('onBefore-2') })
}

const removeOnceLunaListener = () => {
  const removeEventListener = router.once('before', () => internalAlert('Luna.once(before)'))

  internalAlert('Removing Luna.once Listener')
  removeEventListener()

  router.post(page.url, {}, { onBefore: () => internalAlert('onBefore') })
}

const beforeVisit = () => {
  router.on('before', (event) => {
    internalAlert('Luna.on(before)')
    internalAlert(event)
  })

  document.addEventListener('luna:before', (event) => {
    internalAlert('addEventListener(luna:before)')
    internalAlert(event)
  })

  router.post(
    page.url,
    {},
    {
      onBefore: (event) => {
        internalAlert('onBefore')
        internalAlert(event)
      },
      onStart: () => internalAlert('onStart'),
    },
  )
}

const beforeVisitPreventLocal = () => {
  document.addEventListener('luna:before', () => internalAlert('addEventListener(luna:before)'))
  router.on('before', () => internalAlert('Luna.on(before)'))

  router.post(
    page.url,
    {},
    {
      onBefore: () => {
        internalAlert('onBefore')
        return false
      },
      onStart: () => internalAlert('This listener should not have been called.'),
    },
  )
}

const beforeVisitPreventGlobalLuna = () => {
  document.addEventListener('luna:before', () => internalAlert('addEventListener(luna:before)'))
  router.on('before', () => {
    internalAlert('Luna.on(before)')
    return false
  })

  router.post(
    page.url,
    {},
    {
      onBefore: () => internalAlert('onBefore'),
      onStart: () => internalAlert('This listener should not have been called.'),
    },
  )
}

const beforeVisitPreventGlobalNative = () => {
  router.on('before', () => internalAlert('Luna.on(before)'))
  document.addEventListener('luna:before', (event) => {
    internalAlert('addEventListener(luna:before)')
    event.preventDefault()
  })

  router.post(
    page.url,
    {},
    {
      onBefore: () => internalAlert('onBefore'),
      onStart: () => internalAlert('This listener should not have been called.'),
    },
  )
}

const cancelTokenVisit = () => {
  // @ts-expect-error - We're testing that the router doesn't have an onCancelToken listener
  router.on('cancelToken', () => internalAlert('This listener should not have been called.'))
  document.addEventListener('luna:cancelToken', () => internalAlert('This listener should not have been called.'))

  router.post(
    page.url,
    {},
    {
      onCancelToken: (event) => {
        internalAlert('onCancelToken')
        internalAlert(event)
      },
    },
  )
}

const startVisit = () => {
  router.on('start', (event) => {
    internalAlert('Luna.on(start)')
    internalAlert(event)
  })

  document.addEventListener('luna:start', (event) => {
    internalAlert('addEventListener(luna:start)')
    internalAlert(event)
  })

  router.post(
    page.url,
    {},
    {
      onStart: (event) => {
        internalAlert('onStart')
        internalAlert(event)
      },
    },
  )
}

const progressVisit = () => {
  router.on('progress', (event) => {
    internalAlert('Luna.on(progress)')
    internalAlert(event)
  })

  document.addEventListener('luna:progress', (event) => {
    internalAlert('addEventListener(luna:progress)')
    internalAlert(event)
  })

  router.post(page.url, payloadWithFile, {
    onProgress: (event) => {
      internalAlert('onProgress')
      internalAlert(event)
    },
  })
}

const progressNoFilesVisit = () => {
  router.on('progress', (event) => {
    internalAlert('Luna.on(progress)')
    internalAlert(event)
  })

  document.addEventListener('luna:progress', (event) => {
    internalAlert('addEventListener(luna:progress)')
    internalAlert(event)
  })

  router.post(
    page.url,
    {},
    {
      onBefore: () => internalAlert('progressNoFilesOnBefore'),
      onProgress: (event) => {
        internalAlert('onProgress')
        internalAlert(event)
      },
    },
  )
}

const cancelVisit = () => {
  router.on('cancel', (event) => {
    internalAlert('Luna.on(cancel)')
    internalAlert(event)
  })

  document.addEventListener('luna:cancel', (event) => {
    internalAlert('addEventListener(luna:cancel)')
    internalAlert(event)
  })

  router.post(
    page.url,
    {},
    {
      onCancelToken: (token) => token.cancel(),
      // @ts-expect-error - We're testing that the onCancel callback has no arguments, so event will be undefined
      onCancel: (event) => {
        internalAlert('onCancel')
        internalAlert(event)
      },
    },
  )
}

const errorVisit = () => {
  router.on('error', (event) => {
    internalAlert('Luna.on(error)')
    internalAlert(event)
  })

  document.addEventListener('luna:error', (event) => {
    internalAlert('addEventListener(luna:error)')
    internalAlert(event)
  })

  router.post(
    '/events/errors',
    {},
    {
      onError: (errors) => {
        internalAlert('onError')
        internalAlert(errors)
      },
    },
  )
}

const errorPromiseVisit = () => {
  router.post(
    '/events/errors',
    {},
    {
      onError: () => callbackSuccessErrorPromise('onError'),
      onSuccess: () => internalAlert('This listener should not have been called'),
      onFinish: () => internalAlert('onFinish'),
    },
  )
}

const successVisit = () => {
  router.on('success', (event) => {
    internalAlert('Luna.on(success)')
    internalAlert(event)
  })

  document.addEventListener('luna:success', (event) => {
    internalAlert('addEventListener(luna:success)')
    internalAlert(event)
  })

  router.post(
    page.url,
    {},
    {
      onError: () => internalAlert('This listener should not have been called'),
      onSuccess: (page) => {
        internalAlert('onSuccess')
        internalAlert(page)
      },
    },
  )
}

const successPromiseVisit = () => {
  router.post(
    page.url,
    {},
    {
      onSuccess: () => callbackSuccessErrorPromise('onSuccess'),
      onError: () => internalAlert('This listener should not have been called'),
      onFinish: () => internalAlert('onFinish'),
    },
  )
}

const finishVisit = () => {
  router.on('finish', (event) => {
    internalAlert('Luna.on(finish)')
    internalAlert(event)
  })

  document.addEventListener('luna:finish', (event) => {
    internalAlert('addEventListener(luna:finish)')
    internalAlert(event)
  })

  router.post(
    page.url,
    {},
    {
      onFinish: (event) => {
        internalAlert('onFinish')
        internalAlert(event)
      },
    },
  )
}

const httpExceptionVisit = () => {
  router.on('httpException', (event) => {
    internalAlert('Luna.on(httpException)')
    internalAlert(event)
  })

  document.addEventListener('luna:httpException', (event) => {
    internalAlert('addEventListener(luna:httpException)')
    internalAlert(event)
  })

  router.post(
    '/non-luna',
    {},
    {
      onHttpException: () => internalAlert('onHttpException'),
    },
  )
}

const httpExceptionPreventVisit = () => {
  router.on('httpException', (event) => {
    internalAlert('Luna.on(httpException)')
    internalAlert(event)
  })

  document.addEventListener('luna:httpException', (event) => {
    internalAlert('addEventListener(luna:httpException)')
    internalAlert(event)
  })

  router.post(
    '/non-luna',
    {},
    {
      onHttpException: (response) => {
        internalAlert('onHttpException')
        internalAlert(response)
        return false
      },
    },
  )
}

const httpExceptionLunaResponseVisit = () => {
  router.on('httpException', (event) => {
    internalAlert('Luna.on(httpException)')
    internalAlert(event)
  })

  document.addEventListener('luna:httpException', (event) => {
    internalAlert('addEventListener(luna:httpException)')
    internalAlert(event)
  })

  router.get(
    '/luna-error-page',
    {},
    {
      onHttpException: () => internalAlert('onHttpException'),
    },
  )
}

const httpExceptionLunaResponsePreventVisit = () => {
  router.on('httpException', (event) => {
    internalAlert('Luna.on(httpException)')
    internalAlert(event)
  })

  document.addEventListener('luna:httpException', (event) => {
    internalAlert('addEventListener(luna:httpException)')
    internalAlert(event)
  })

  router.get(
    '/luna-error-page',
    {},
    {
      onHttpException: (response) => {
        internalAlert('onHttpException')
        internalAlert(response)
        return false
      },
    },
  )
}

const networkErrorVisit = () => {
  router.on('networkError', (event) => {
    internalAlert('Luna.on(networkError)')
    internalAlert(event)
  })

  document.addEventListener('luna:networkError', (event) => {
    internalAlert('addEventListener(luna:networkError)')
    internalAlert(event)
  })

  router.post(
    '/disconnect',
    {},
    {
      onNetworkError: () => internalAlert('onNetworkError'),
    },
  )
}

const networkErrorPreventVisit = () => {
  router.on('networkError', (event) => {
    internalAlert('Luna.on(networkError)')
    internalAlert(event)
  })

  document.addEventListener('luna:networkError', (event) => {
    internalAlert('addEventListener(luna:networkError)')
    internalAlert(event)
  })

  router.post(
    '/disconnect',
    {},
    {
      onNetworkError: (error) => {
        internalAlert('onNetworkError')
        internalAlert(error)
        return false
      },
    },
  )
}

const navigateVisit = () => {
  router.on('navigate', (event) => {
    internalAlert('Luna.on(navigate)')
    internalAlert(event)
  })

  document.addEventListener('luna:navigate', (event) => {
    internalAlert('addEventListener(luna:navigate)')
    internalAlert(event)
  })

  router.get(
    '/',
    {},
    {
      // @ts-expect-error - We're testing that the VisitCallbacks interface does not have an onNavigate method
      onNavigate: () => internalAlert('This listener should not have been called.'),
    },
  )
}

const registerAllListeners = () => {
  router.on('before', () => internalAlert('Luna.on(before)'))
  // @ts-expect-error - We're testing that the router doesn't have an onCancelToken listener
  router.on('cancelToken', () => internalAlert('Luna.on(cancelToken)'))
  router.on('cancel', () => internalAlert('Luna.on(cancel)'))
  router.on('start', () => internalAlert('Luna.on(start)'))
  router.on('progress', () => internalAlert('Luna.on(progress)'))
  router.on('error', () => internalAlert('Luna.on(error)'))
  router.on('success', () => internalAlert('Luna.on(success)'))
  router.on('httpException', () => internalAlert('Luna.on(httpException)'))
  router.on('networkError', () => internalAlert('Luna.on(networkError)'))
  router.on('finish', () => internalAlert('Luna.on(finish)'))
  router.on('navigate', () => internalAlert('Luna.on(navigate)'))
  document.addEventListener('luna:before', () => internalAlert('addEventListener(luna:before)'))
  document.addEventListener('luna:cancelToken', () => internalAlert('addEventListener(luna:cancelToken)'))
  document.addEventListener('luna:cancel', () => internalAlert('addEventListener(luna:cancel)'))
  document.addEventListener('luna:start', () => internalAlert('addEventListener(luna:start)'))
  document.addEventListener('luna:progress', () => internalAlert('addEventListener(luna:progress)'))
  document.addEventListener('luna:error', () => internalAlert('addEventListener(luna:error)'))
  document.addEventListener('luna:success', () => internalAlert('addEventListener(luna:success)'))
  document.addEventListener('luna:httpException', () => internalAlert('addEventListener(luna:httpException)'))
  document.addEventListener('luna:networkError', () => internalAlert('addEventListener(luna:networkError)'))
  document.addEventListener('luna:finish', () => internalAlert('addEventListener(luna:finish)'))
  document.addEventListener('luna:navigate', () => internalAlert('addEventListener(luna:navigate)'))

  return {
    onBefore: () => internalAlert('onBefore'),
    onCancelToken: () => internalAlert('onCancelToken'),
    onCancel: () => internalAlert('onCancel'),
    onStart: () => internalAlert('onStart'),
    onProgress: () => internalAlert('onProgress'),
    onError: () => internalAlert('onError'),
    onSuccess: () => internalAlert('onSuccess'),
    onHttpException: () => internalAlert('onHttpException'),
    onNetworkError: () => internalAlert('onNetworkError'),
    onFinish: () => internalAlert('onFinish'),
    onNavigate: () => internalAlert('onNavigate'), // Does not exist.
  }
}

const lifecycleSuccess = () => {
  router.post(page.url, payloadWithFile, registerAllListeners())
}

const lifecycleError = () => {
  router.post('/events/errors', payloadWithFile, registerAllListeners())
}

const lifecycleCancel = () => {
  router.post('/sleep', payloadWithFile, {
    ...registerAllListeners(),
    onCancelToken: (token) => {
      internalAlert('onCancelToken')

      setTimeout(() => {
        internalAlert('CANCELLING!')
        token.cancel()
      }, 250)
    },
  })
}

const lifecycleCancelAfterFinish = () => {
  type CancelToken = {
    cancel: () => void
  }

  let cancelToken = <CancelToken | null>null

  router.post(page.url, payloadWithFile, {
    ...registerAllListeners(),
    onCancelToken: (token: CancelToken) => {
      internalAlert('onCancelToken')
      cancelToken = token
    },
    onFinish: () => {
      internalAlert('onFinish')
      internalAlert('CANCELLING!')
      cancelToken?.cancel()
    },
  })
}

const callbackSuccessErrorPromise = (eventName: string) => {
  internalAlert(eventName)
  setTimeout(() => internalAlert('onFinish should have been fired by now if Promise functionality did not work'), 5)
  return new Promise((resolve) => setTimeout(resolve, 20))
}
</script>

<template>
  <div>
    <!-- Listeners -->
    <a href="#" @click.prevent="withoutEventListeners" class="without-listeners">Basic Visit</a>
    <a href="#" @click.prevent="removeLunaListener" class="remove-luna-listener">Remove Luna Listener</a>
    <a href="#" @click.prevent="onceLunaListener" class="register-luna-once-listener"
      >Register Luna Once Listener</a
    >
    <a href="#" @click.prevent="removeOnceLunaListener" class="remove-luna-once-listener"
      >Remove Luna Once Listener</a
    >

    <!-- Events: Before -->
    <a href="#" @click.prevent="beforeVisit" class="before">Before Event</a>
    <a href="#" @click.prevent="beforeVisitPreventLocal" class="before-prevent-local">Before Event (Prevent)</a>
    <Link
      :href="$page.url"
      method="post"
      @before="(visit) => internalAlert('linkOnBefore', visit)"
      @start="() => internalAlert('linkOnStart')"
      class="link-before"
      >Before Event Link</Link
    >
    <Link
      :href="$page.url"
      method="post"
      @before="
        () => {
          internalAlert('linkOnBefore')
          return false
        }
      "
      @start="() => internalAlert('This listener should not have been called.')"
      class="link-before-prevent-local"
      >Before Event Link (Prevent)</Link
    >
    <a href="#" @click.prevent="beforeVisitPreventGlobalLuna" class="before-prevent-global-luna"
      >Before Event - Prevent globally using Luna Event Listener</a
    >
    <a href="#" @click.prevent="beforeVisitPreventGlobalNative" class="before-prevent-global-native"
      >Before Event - Prevent globally using Native Event Listeners</a
    >

    <!-- Events: CancelToken -->
    <a href="#" @click.prevent="cancelTokenVisit" class="canceltoken">Cancel Token Event</a>
    <Link
      :href="$page.url"
      method="post"
      @cancelToken="(event) => internalAlert('linkOnCancelToken', event)"
      class="link-canceltoken"
      >Cancel Token Event Link</Link
    >

    <!-- Events: Cancel -->
    <a href="#" @click.prevent="cancelVisit" class="cancel">Cancel Event</a>

    <!-- @vue-expect-error - We're testing that the onCancel callback has no arguments, so event will be undefined -->
    <Link
      :href="$page.url"
      method="post"
      @cancelToken="(token) => token.cancel()"
      @cancel="(event) => internalAlert('linkOnCancel', event)"
      class="link-cancel"
      >Cancel Event Link</Link
    >

    <!-- Events: Start -->
    <a href="#" @click.prevent="startVisit" class="start">Start Event</a>
    <Link :href="$page.url" method="post" @start="(event) => internalAlert('linkOnStart', event)" class="link-start"
      >Start Event Link</Link
    >

    <!-- Events: Progress -->
    <a href="#" @click.prevent="progressVisit" class="progress">Progress Event</a>
    <a href="#" @click.prevent="progressNoFilesVisit" class="progress-no-files">Missing Progress Event (no files)</a>
    <Link
      :href="$page.url"
      method="post"
      :data="payloadWithFile"
      @progress="(event) => internalAlert('linkOnProgress', event)"
      class="link-progress"
      >Progress Event Link</Link
    >
    <Link
      :href="$page.url"
      method="post"
      @before="() => internalAlert('linkProgressNoFilesOnBefore')"
      @progress="(event) => internalAlert('linkOnProgress', event)"
      class="link-progress-no-files"
      >Progress Event Link (no files)</Link
    >

    <!-- Events: Error -->
    <a href="#" @click.prevent="errorVisit" class="error">Error Event</a>
    <a href="#" @click.prevent="errorPromiseVisit" class="error-promise">Error Event (delaying onFinish w/ Promise)</a>
    <Link
      href="/events/errors"
      method="post"
      @error="(errors) => internalAlert('linkOnError', errors)"
      @success="() => internalAlert('This listener should not have been called')"
      class="link-error"
      >Error Event Link</Link
    >
    <Link
      href="/events/errors"
      method="post"
      @error="() => callbackSuccessErrorPromise('linkOnError')"
      @success="() => internalAlert('This listener should not have been called')"
      @finish="() => internalAlert('linkOnFinish')"
      class="link-error-promise"
      >Error Event Link (delaying onFinish w/ Promise)</Link
    >

    <!-- Events: Success -->
    <a href="#" @click.prevent="successVisit" class="success">Success Event</a>
    <a href="#" @click.prevent="successPromiseVisit" class="success-promise"
      >Success Event (delaying onFinish w/ Promise)</a
    >
    <Link
      :href="$page.url"
      method="post"
      @error="() => internalAlert('This listener should not have been called')"
      @success="(event) => internalAlert('linkOnSuccess', event)"
      class="link-success"
      >Success Event Link</Link
    >
    <Link
      :href="$page.url"
      method="post"
      @error="() => internalAlert('This listener should not have been called')"
      @success="() => callbackSuccessErrorPromise('linkOnSuccess')"
      @finish="() => internalAlert('linkOnFinish')"
      class="link-success-promise"
      >Success Event Link (delaying onFinish w/ Promise)</Link
    >

    <!-- Events: HTTP Exception -->
    <a href="#" @click.prevent="httpExceptionVisit" class="http-exception">HTTP Exception Event</a>
    <a href="#" @click.prevent="httpExceptionPreventVisit" class="http-exception-prevent"
      >HTTP Exception Event (Prevent)</a
    >
    <a href="#" @click.prevent="httpExceptionLunaResponseVisit" class="http-exception-luna-response"
      >HTTP Exception Event (Luna Response)</a
    >
    <a
      href="#"
      @click.prevent="httpExceptionLunaResponsePreventVisit"
      class="http-exception-luna-response-prevent"
      >HTTP Exception Event (Luna Response Prevent)</a
    >

    <!-- Events: Network Error -->
    <a href="#" @click.prevent="networkErrorVisit" class="network-error">Network Error Event</a>
    <a href="#" @click.prevent="networkErrorPreventVisit" class="network-error-prevent"
      >Network Error Event (Prevent)</a
    >

    <!-- Events: Finish -->
    <a href="#" @click.prevent="finishVisit" class="finish">Finish Event</a>
    <Link :href="$page.url" method="post" @finish="(event) => internalAlert('linkOnFinish', event)" class="link-finish"
      >Finish Event Link</Link
    >

    <!-- Events: Navigate -->
    <a href="#" @click.prevent="navigateVisit" class="navigate">Navigate Event</a>

    <!-- Events: Prefetch -->
    <Link
      as="button"
      href="/prefetch/2"
      prefetch="hover"
      @prefetching="(visit) => internalAlert('linkOnPrefetching', visit)"
      @prefetched="(response, visit) => internalAlert('linkOnPrefetched', response, visit)"
      class="link-prefetch-hover"
    >
      Prefetch Event Link (Hover)
    </Link>

    <!-- Lifecycles -->
    <a href="#" @click.prevent="lifecycleSuccess" class="lifecycle-success">Lifecycle Success</a>
    <a href="#" @click.prevent="lifecycleError" class="lifecycle-error">Lifecycle Error</a>
    <a href="#" @click.prevent="lifecycleCancel" class="lifecycle-cancel">Lifecycle Cancel</a>
    <a href="#" @click.prevent="lifecycleCancelAfterFinish" class="lifecycle-cancel-after-finish"
      >Lifecycle Cancel - After Finish</a
    >
  </div>
</template>
