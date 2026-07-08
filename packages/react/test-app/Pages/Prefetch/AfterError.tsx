import { router } from '@laraxgram/react'

export default function AfterError() {
  const prefetchPage = () => {
    router.prefetch('/prefetch/swr/1', { method: 'get' }, { cacheFor: 5000 })
  }

  const visitPage = () => {
    router.visit('/prefetch/swr/1')
  }

  const prefetchNonLuna = () => {
    router.prefetch('/non-luna', { method: 'get' }, { cacheFor: 5000 })
  }

  const visitNonLuna = () => {
    router.visit('/non-luna')
  }

  return (
    <div>
      <button onClick={prefetchPage}>Prefetch Page</button>
      <button onClick={visitPage}>Visit Page</button>
      <button onClick={prefetchNonLuna}>Prefetch Non-Luna</button>
      <button onClick={visitNonLuna}>Visit Non-Luna</button>
    </div>
  )
}
