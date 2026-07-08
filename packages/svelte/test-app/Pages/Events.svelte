<script module lang="ts">
  declare global {
    interface Window {
      messages: unknown[]
    }
  }
</script>

<script lang="ts">
  import { luna, page, router } from '@lunajs/svelte'

  const payloadWithFile = {
    file: new File(['foobar'], 'example.bin'),
  }

  window.messages = []

  const internalAlert = (...args: unknown[]) => {
    window.messages.push(...args)
  }

  const withoutEventListeners = (e: Event) => {
    e.preventDefault()

    router.post(page.url, {})
  }

  const removeLunaListener = (e: Event) => {
    e.preventDefault()

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

  const onceLunaListener = (e: Event) => {
    e.preventDefault()

    router.once('before', () => internalAlert('Luna.once(before)'))

    router.post(page.url, {}, { onBefore: () => internalAlert('onBefore-1') })
    router.post(page.url, {}, { onBefore: () => internalAlert('onBefore-2') })
  }

  const removeOnceLunaListener = (e: Event) => {
    e.preventDefault()

    const removeEventListener = router.once('before', () => internalAlert('Luna.once(before)'))

    internalAlert('Removing Luna.once Listener')
    removeEventListener()

    router.post(page.url, {}, { onBefore: () => internalAlert('onBefore') })
  }

  const beforeVisit = (e: Event) => {
    e.preventDefault()

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

  const beforeVisitPreventLocal = (e: Event) => {
    e.preventDefault()

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

  const beforeVisitPreventGlobalLuna = (e: Event) => {
    e.preventDefault()
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

  const beforeVisitPreventGlobalNative = (e: Event) => {
    e.preventDefault()

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

  const cancelTokenVisit = (e: Event) => {
    e.preventDefault()

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

  const startVisit = (e: Event) => {
    e.preventDefault()

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

  const progressVisit = (e: Event) => {
    e.preventDefault()

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

  const progressNoFilesVisit = (e: Event) => {
    e.preventDefault()

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

  const cancelVisit = (e: Event) => {
    e.preventDefault()

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
        onCancelToken: (token) => {
          token.cancel()
        },
        // @ts-expect-error - We're testing that the onCancel callback has no arguments, so event will be undefined
        onCancel: (event) => {
          internalAlert('onCancel')
          internalAlert(event)
        },
      },
    )
  }

  const errorVisit = (e: Event) => {
    e.preventDefault()

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

  const errorPromiseVisit = (e: Event) => {
    e.preventDefault()

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

  const successVisit = (e: Event) => {
    e.preventDefault()

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

  const successPromiseVisit = (e: Event) => {
    e.preventDefault()

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

  const finishVisit = (e: Event) => {
    e.preventDefault()

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

  const httpExceptionVisit = (e: Event) => {
    e.preventDefault()

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

  const httpExceptionPreventVisit = (e: Event) => {
    e.preventDefault()

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

  const httpExceptionLunaResponseVisit = (e: Event) => {
    e.preventDefault()

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

  const httpExceptionLunaResponsePreventVisit = (e: Event) => {
    e.preventDefault()

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

  const networkErrorVisit = (e: Event) => {
    e.preventDefault()

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

  const networkErrorPreventVisit = (e: Event) => {
    e.preventDefault()

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

  const navigateVisit = (e: Event) => {
    e.preventDefault()

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

  const lifecycleSuccess = (e: Event) => {
    e.preventDefault()

    router.post(page.url, payloadWithFile, registerAllListeners())
  }

  const lifecycleError = (e: Event) => {
    e.preventDefault()

    router.post('/events/errors', payloadWithFile, registerAllListeners())
  }

  const lifecycleCancel = (e: Event) => {
    e.preventDefault()

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

  const lifecycleCancelAfterFinish = (e: Event) => {
    e.preventDefault()

    let cancelToken: { cancel: () => void } | null = null

    router.post(page.url, payloadWithFile, {
      ...registerAllListeners(),
      onCancelToken: (token) => {
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

  const handleCancelToken = (event: CustomEvent) => {
    ;(event.detail as { token: { cancel: () => void } }).token.cancel()
  }

  const handleCancel = (event: Event | CustomEvent) => {
    const customEvent = event as CustomEvent
    internalAlert('linkOnCancel', customEvent.detail || undefined)
  }

  const handleProgress = (event: Event | CustomEvent<{ progress: unknown }>) => {
    const customEvent = event as CustomEvent<{ progress: unknown }>
    internalAlert('linkOnProgress', customEvent.detail.progress)
  }

  const handleError = (event: Event | CustomEvent<{ errors: unknown }>) => {
    const customEvent = event as CustomEvent<{ errors: unknown }>
    internalAlert('linkOnError', customEvent.detail.errors)
  }
</script>

<div>
  <!-- Listeners -->
  <a href={'#'} onclick={withoutEventListeners} class="without-listeners">Basic Visit</a>
  <a href={'#'} onclick={removeLunaListener} class="remove-luna-listener">Remove Luna Listener</a>
  <a href={'#'} onclick={onceLunaListener} class="register-luna-once-listener">Register Luna Once Listener</a>
  <a href={'#'} onclick={removeOnceLunaListener} class="remove-luna-once-listener">Remove Luna Once Listener</a
  >

  <!-- Events: Before -->
  <a href={'#'} onclick={beforeVisit} class="before">Before Event</a>
  <a href={'#'} onclick={beforeVisitPreventLocal} class="before-prevent-local">Before Event (Prevent)</a>
  <button
    use:luna={{ href: page.url, method: 'post' }}
    onbefore={(event) => internalAlert('linkOnBefore', event.detail.visit)}
    onstart={() => internalAlert('linkOnStart')}
    class="link-before">Before Event Link</button
  >
  <button
    use:luna={{ href: page.url, method: 'post' }}
    onbefore={(event) => {
      event.preventDefault()
      internalAlert('linkOnBefore')
    }}
    onstart={() => {
      internalAlert('This listener should not have been called.')
    }}
    class="link-before-prevent-local">Before Event Link (Prevent)</button
  >
  <a href={'#'} onclick={beforeVisitPreventGlobalLuna} class="before-prevent-global-luna"
    >Before Event - Prevent globally using Luna Event Listener</a
  >
  <a href={'#'} onclick={beforeVisitPreventGlobalNative} class="before-prevent-global-native"
    >Before Event - Prevent globally using Native Event Listeners</a
  >

  <!-- Events: CancelToken -->
  <a href={'#'} onclick={cancelTokenVisit} class="canceltoken">Cancel Token Event</a>
  <button
    use:luna={{ href: page.url, method: 'post' }}
    oncancel-token={(event) => internalAlert('linkOnCancelToken', event.detail)}
    class="link-canceltoken">Cancel Token Event Link</button
  >

  <!-- Events: Cancel -->
  <a href={'#'} onclick={cancelVisit} class="cancel">Cancel Event</a>
  <button
    use:luna={{ href: page.url, method: 'post' }}
    oncancel-token={handleCancelToken}
    oncancel={handleCancel}
    class="link-cancel">Cancel Event Link</button
  >

  <!-- Events: Start -->
  <a href={'#'} onclick={startVisit} class="start">Start Event</a>
  <button
    use:luna={{ href: page.url, method: 'post' }}
    onstart={(event) => internalAlert('linkOnStart', event.detail.visit)}
    class="link-start">Start Event Link</button
  >

  <!-- Events: Progress -->
  <a href={'#'} onclick={progressVisit} class="progress">Progress Event</a>
  <a href={'#'} onclick={progressNoFilesVisit} class="progress-no-files">Missing Progress Event (no files)</a>
  <button
    use:luna={{ href: page.url, method: 'post', data: payloadWithFile }}
    onprogress={handleProgress}
    class="link-progress">Progress Event Link</button
  >
  <button
    use:luna={{ href: page.url, method: 'post' }}
    onbefore={() => internalAlert('linkProgressNoFilesOnBefore')}
    onprogress={handleProgress}
    class="link-progress-no-files">Progress Event Link (no files)</button
  >

  <!-- Events: Error -->
  <a href={'#'} onclick={errorVisit} class="error">Error Event</a>
  <a href={'#'} onclick={errorPromiseVisit} class="error-promise">Error Event (delaying onFinish w/ Promise)</a>
  <button
    use:luna={{ href: '/events/errors', method: 'post' }}
    onerror={handleError}
    onsuccess={() => internalAlert('This listener should not have been called')}
    class="link-error">Error Event Link</button
  >
  <button
    use:luna={{ href: '/events/errors', method: 'post' }}
    onerror={() => callbackSuccessErrorPromise('linkOnError')}
    onsuccess={() => internalAlert('This listener should not have been called')}
    onfinish={() => internalAlert('linkOnFinish')}
    class="link-error-promise">Error Event Link (delaying onFinish w/ Promise)</button
  >

  <!-- Events: Success -->
  <a href={'#'} onclick={successVisit} class="success">Success Event</a>
  <a href={'#'} onclick={successPromiseVisit} class="success-promise">Success Event (delaying onFinish w/ Promise)</a>
  <button
    use:luna={{ href: page.url, method: 'post' }}
    onerror={() => internalAlert('This listener should not have been called')}
    onsuccess={(event) => internalAlert('linkOnSuccess', event.detail.page)}
    class="link-success">Success Event Link</button
  >
  <button
    use:luna={{ href: page.url, method: 'post' }}
    onerror={() => internalAlert('This listener should not have been called')}
    onsuccess={() => callbackSuccessErrorPromise('linkOnSuccess')}
    onfinish={() => internalAlert('linkOnFinish')}
    class="link-success-promise">Success Event Link (delaying onFinish w/ Promise)</button
  >

  <!-- Events: HTTP Exception -->
  <a href={'#'} onclick={httpExceptionVisit} class="http-exception">HTTP Exception Event</a>
  <a href={'#'} onclick={httpExceptionPreventVisit} class="http-exception-prevent">HTTP Exception Event (Prevent)</a>
  <a href={'#'} onclick={httpExceptionLunaResponseVisit} class="http-exception-luna-response"
    >HTTP Exception Event (Luna Response)</a
  >
  <a href={'#'} onclick={httpExceptionLunaResponsePreventVisit} class="http-exception-luna-response-prevent"
    >HTTP Exception Event (Luna Response Prevent)</a
  >

  <!-- Events: Network Error -->
  <a href={'#'} onclick={networkErrorVisit} class="network-error">Network Error Event</a>
  <a href={'#'} onclick={networkErrorPreventVisit} class="network-error-prevent">Network Error Event (Prevent)</a>

  <!-- Events: Finish -->
  <a href={'#'} onclick={finishVisit} class="finish">Finish Event</a>
  <button
    use:luna={{ href: page.url, method: 'post' }}
    onfinish={(event) => internalAlert('linkOnFinish', event.detail.visit)}
    class="link-finish">Finish Event Link</button
  >

  <!-- Events: Navigate -->
  <a href={'#'} onclick={navigateVisit} class="navigate">Navigate Event</a>

  <!-- Events: Prefetch -->
  <button
    use:luna={{ href: '/prefetch/2', prefetch: 'hover' }}
    onprefetching={(event) => internalAlert('linkOnPrefetching', event.detail.visit)}
    onprefetched={(event) => internalAlert('linkOnPrefetched', event.detail.response, event.detail.visit)}
    class="link-prefetch-hover"
  >
    Prefetch Event Link (Hover)
  </button>

  <!-- Lifecycles -->
  <a href={'#'} onclick={lifecycleSuccess} class="lifecycle-success">Lifecycle Success</a>
  <a href={'#'} onclick={lifecycleError} class="lifecycle-error">Lifecycle Error</a>
  <a href={'#'} onclick={lifecycleCancel} class="lifecycle-cancel">Lifecycle Cancel</a>
  <a href={'#'} onclick={lifecycleCancelAfterFinish} class="lifecycle-cancel-after-finish"
    >Lifecycle Cancel - After Finish</a
  >
</div>
