import { router } from '@laraxgram/react'

export default () => {
  const invalidVisit = () => {
    router.post('/non-luna')
  }

  const invalidVisitJson = () => {
    router.post('/json')
  }

  const invalidVisitXss = () => {
    router.post('/non-luna/xss')
  }

  return (
    <div>
      <span onClick={invalidVisit} className="invalid-visit">
        Invalid Visit
      </span>
      <span onClick={invalidVisitJson} className="invalid-visit-json">
        Invalid Visit (JSON response)
      </span>
      <span onClick={invalidVisitXss} className="invalid-visit-xss">
        Invalid Visit (XSS)
      </span>
    </div>
  )
}
