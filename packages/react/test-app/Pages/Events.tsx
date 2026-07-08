import { Link, router, usePage } from '@laraxgram/react'

declare global {
  interface Window {
    messages: unknown[]
  }
}

window.messages = []

export default () => {
  const payloadWithFile = {
    file: new File(['foobar'], 'example.bin'),
  }

  const page = usePage()

  const internalAlert = (...args: unknown[]) => {
    args.forEach((arg) => window.messages.push(arg))
  }

  const withoutEventListeners = (e: React.MouseEvent) => {
    e.preventDefault()
    router.post(page.url, {})
  }

  const removeLunaListener = (e: React.MouseEvent) => {
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

  const onceLunaListener = (e: React.MouseEvent) => {
    e.preventDefault()
    router.once('before', () => internalAlert('Luna.once(before)'))

    router.post(page.url, {}, { onBefore: () => internalAlert('onBefore-1') })
    router.post(page.url, {}, { onBefore: () => internalAlert('onBefore-2') })
  }

  const removeOnceLunaListener = (e: React.MouseEvent) => {
    e.preventDefault()
    const removeEventListener = router.once('before', () => internalAlert('Luna.once(before)'))

    internalAlert('Removing Luna.once Listener')
    removeEventListener()

    router.post(page.url, {}, { onBefore: () => internalAlert('onBefore') })
  }

  const beforeVisit = (e: React.MouseEvent) => {
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

  const beforeVisitPreventLocal = (e: React.MouseEvent) => {
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

  const beforeVisitPreventGlobalLuna = (e: React.MouseEvent) => {
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

  const beforeVisitPreventGlobalNative = (e: React.MouseEvent) => {
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

  const cancelTokenVisit = (e: React.MouseEvent) => {
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

  const startVisit = (e: React.MouseEvent) => {
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

  const progressVisit = (e: React.MouseEvent) => {
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

  const progressNoFilesVisit = (e: React.MouseEvent) => {
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

  const cancelVisit = (e: React.MouseEvent) => {
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
        onCancelToken: (token) => token.cancel(),
        // @ts-expect-error - We're testing that the onCancel callback has no arguments, so event will be undefined
        onCancel: (event) => {
          internalAlert('onCancel')
          internalAlert(event)
        },
      },
    )
  }

  const errorVisit = (e: React.MouseEvent) => {
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

  const errorPromiseVisit = (e: React.MouseEvent) => {
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

  const successVisit = (e: React.MouseEvent) => {
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

  const successPromiseVisit = (e: React.MouseEvent) => {
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

  const finishVisit = (e: React.MouseEvent) => {
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

  const httpExceptionVisit = (e: React.MouseEvent) => {
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

  const httpExceptionPreventVisit = (e: React.MouseEvent) => {
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

  const httpExceptionLunaResponseVisit = (e: React.MouseEvent) => {
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

  const httpExceptionLunaResponsePreventVisit = (e: React.MouseEvent) => {
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

  const networkErrorVisit = (e: React.MouseEvent) => {
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

  const networkErrorPreventVisit = (e: React.MouseEvent) => {
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

  const navigateVisit = (e: React.MouseEvent) => {
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

  const lifecycleSuccess = (e: React.MouseEvent) => {
    e.preventDefault()
    router.post(page.url, payloadWithFile, registerAllListeners())
  }

  const lifecycleError = (e: React.MouseEvent) => {
    e.preventDefault()
    router.post('/events/errors', payloadWithFile, registerAllListeners())
  }

  const lifecycleCancel = (e: React.MouseEvent) => {
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

  const lifecycleCancelAfterFinish = (e: React.MouseEvent) => {
    e.preventDefault()
    type CancelToken = {
      cancel: () => void
    }

    let cancelToken = null as CancelToken | null

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

  return (
    <div>
      {/* Listeners */}
      <a href="#" onClick={withoutEventListeners} className="without-listeners">
        Basic Visit
      </a>
      <a href="#" onClick={removeLunaListener} className="remove-luna-listener">
        Remove Luna Listener
      </a>
      <a href="#" onClick={onceLunaListener} className="register-luna-once-listener">
        Register Luna Once Listener
      </a>
      <a href="#" onClick={removeOnceLunaListener} className="remove-luna-once-listener">
        Remove Luna Once Listener
      </a>

      {/* Events: Before */}
      <a href="#" onClick={beforeVisit} className="before">
        Before Event
      </a>
      <a href="#" onClick={beforeVisitPreventLocal} className="before-prevent-local">
        Before Event (Prevent)
      </a>
      <Link
        href={page.url}
        method="post"
        onBefore={(visit) => internalAlert('linkOnBefore', visit)}
        onStart={() => internalAlert('linkOnStart')}
        className="link-before"
      >
        Before Event Link
      </Link>
      <Link
        href={page.url}
        method="post"
        onBefore={() => {
          internalAlert('linkOnBefore')
          return false
        }}
        onStart={() => internalAlert('This listener should not have been called.')}
        className="link-before-prevent-local"
      >
        Before Event Link (Prevent)
      </Link>
      <a href="#" onClick={beforeVisitPreventGlobalLuna} className="before-prevent-global-luna">
        Before Event - Prevent globally using Luna Event Listener
      </a>
      <a href="#" onClick={beforeVisitPreventGlobalNative} className="before-prevent-global-native">
        Before Event - Prevent globally using Native Event Listeners
      </a>

      {/* Events: CancelToken */}
      <a href="#" onClick={cancelTokenVisit} className="canceltoken">
        Cancel Token Event
      </a>
      <Link
        href={page.url}
        method="post"
        onCancelToken={(event) => internalAlert('linkOnCancelToken', event)}
        className="link-canceltoken"
      >
        Cancel Token Event Link
      </Link>

      {/* Events: Cancel */}
      <a href="#" onClick={cancelVisit} className="cancel">
        Cancel Event
      </a>
      <Link
        href={page.url}
        method="post"
        onCancelToken={(token) => token.cancel()}
        // @ts-expect-error - We're testing that the onCancel callback has no arguments, so event will be undefined
        onCancel={(event) => internalAlert('linkOnCancel', event)}
        className="link-cancel"
      >
        Cancel Event Link
      </Link>

      {/* Events: Start */}
      <a href="#" onClick={startVisit} className="start">
        Start Event
      </a>
      <Link
        href={page.url}
        method="post"
        onStart={(event) => internalAlert('linkOnStart', event)}
        className="link-start"
      >
        Start Event Link
      </Link>

      {/* Events: Progress */}
      <a href="#" onClick={progressVisit} className="progress">
        Progress Event
      </a>
      <a href="#" onClick={progressNoFilesVisit} className="progress-no-files">
        Missing Progress Event (no files)
      </a>
      <Link
        href={page.url}
        method="post"
        data={payloadWithFile}
        onProgress={(event) => internalAlert('linkOnProgress', event)}
        className="link-progress"
      >
        Progress Event Link
      </Link>
      <Link
        href={page.url}
        method="post"
        onBefore={() => internalAlert('linkProgressNoFilesOnBefore')}
        onProgress={(event) => internalAlert('linkOnProgress', event)}
        className="link-progress-no-files"
      >
        Progress Event Link (no files)
      </Link>

      {/* Events: Error */}
      <a href="#" onClick={errorVisit} className="error">
        Error Event
      </a>
      <a href="#" onClick={errorPromiseVisit} className="error-promise">
        Error Event (delaying onFinish w/ Promise)
      </a>
      <Link
        href="/events/errors"
        method="post"
        onError={(errors) => internalAlert('linkOnError', errors)}
        onSuccess={() => internalAlert('This listener should not have been called')}
        className="link-error"
      >
        Error Event Link
      </Link>
      <Link
        href="/events/errors"
        method="post"
        onError={() => callbackSuccessErrorPromise('linkOnError')}
        onSuccess={() => internalAlert('This listener should not have been called')}
        onFinish={() => internalAlert('linkOnFinish')}
        className="link-error-promise"
      >
        Error Event Link (delaying onFinish w/ Promise)
      </Link>

      {/* Events: Success */}
      <a href="#" onClick={successVisit} className="success">
        Success Event
      </a>
      <a href="#" onClick={successPromiseVisit} className="success-promise">
        Success Event (delaying onFinish w/ Promise)
      </a>
      <Link
        href={page.url}
        method="post"
        onError={() => internalAlert('This listener should not have been called')}
        onSuccess={(event) => internalAlert('linkOnSuccess', event)}
        className="link-success"
      >
        Success Event Link
      </Link>
      <Link
        href={page.url}
        method="post"
        onError={() => internalAlert('This listener should not have been called')}
        onSuccess={() => callbackSuccessErrorPromise('linkOnSuccess')}
        onFinish={() => internalAlert('linkOnFinish')}
        className="link-success-promise"
      >
        Success Event Link (delaying onFinish w/ Promise)
      </Link>

      {/* Events: HTTP Exception */}
      <a href="#" onClick={httpExceptionVisit} className="http-exception">
        HTTP Exception Event
      </a>
      <a href="#" onClick={httpExceptionPreventVisit} className="http-exception-prevent">
        HTTP Exception Event (Prevent)
      </a>
      <a href="#" onClick={httpExceptionLunaResponseVisit} className="http-exception-luna-response">
        HTTP Exception Event (Luna Response)
      </a>
      <a
        href="#"
        onClick={httpExceptionLunaResponsePreventVisit}
        className="http-exception-luna-response-prevent"
      >
        HTTP Exception Event (Luna Response Prevent)
      </a>

      {/* Events: Network Error */}
      <a href="#" onClick={networkErrorVisit} className="network-error">
        Network Error Event
      </a>
      <a href="#" onClick={networkErrorPreventVisit} className="network-error-prevent">
        Network Error Event (Prevent)
      </a>

      {/* Events: Finish */}
      <a href="#" onClick={finishVisit} className="finish">
        Finish Event
      </a>
      <Link
        href={page.url}
        method="post"
        onFinish={(event) => internalAlert('linkOnFinish', event)}
        className="link-finish"
      >
        Finish Event Link
      </Link>

      {/* Events: Navigate */}
      <a href="#" onClick={navigateVisit} className="navigate">
        Navigate Event
      </a>

      {/* Events: Prefetch */}
      <Link
        as="button"
        href="/prefetch/2"
        prefetch="hover"
        onPrefetching={(visit) => internalAlert('linkOnPrefetching', visit)}
        onPrefetched={(response, visit) => internalAlert('linkOnPrefetched', response, visit)}
        className="link-prefetch-hover"
      >
        Prefetch Event Link (Hover)
      </Link>

      {/* Lifecycles */}
      <a href="#" onClick={lifecycleSuccess} className="lifecycle-success">
        Lifecycle Success
      </a>
      <a href="#" onClick={lifecycleError} className="lifecycle-error">
        Lifecycle Error
      </a>
      <a href="#" onClick={lifecycleCancel} className="lifecycle-cancel">
        Lifecycle Cancel
      </a>
      <a href="#" onClick={lifecycleCancelAfterFinish} className="lifecycle-cancel-after-finish">
        Lifecycle Cancel - After Finish
      </a>
    </div>
  )
}
