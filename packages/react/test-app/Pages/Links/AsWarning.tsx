import type { Method } from '@lunajs/core'
import { Link } from '@lunajs/react'

export default ({ method }: { method: Method }) => {
  return (
    <div>
      <span className="text">This is the links page that demonstrates luna-links with an 'as' warning</span>

      <Link method={method} href="/example" className="get">
        {method} Link
      </Link>
    </div>
  )
}
