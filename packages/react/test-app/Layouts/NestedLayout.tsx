import { usePage } from '@laraxgram/react'
import { useId, useState } from 'react'

export default ({ children }: { children: React.ReactNode }) => {
  const [createdAt] = useState(Date.now())

  window._luna_nested_layout_id = useId()
  window._luna_nested_layout_props = usePage().props

  return (
    <div>
      <span>Nested Layout</span>
      <span>{createdAt}</span>
      <div>{children}</div>
    </div>
  )
}
