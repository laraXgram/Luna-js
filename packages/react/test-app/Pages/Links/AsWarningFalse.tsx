import type { Method } from '@lunajs/core'
import { Link } from '@lunajs/react'

export default ({ method }: { method: Method }) => {
  return (
    <div>
      <span className="text">This is the links page that demonstrates luna-links without the 'as' warning</span>

      <Link method={method} href="/example" className="get" as="button">
        {method} button Link
      </Link>
    </div>
  )
}
