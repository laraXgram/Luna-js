import { usePage } from '@lunajs/react'
import { useId, useState } from 'react'

export default function FnSiteLayout({ children }: { children: React.ReactNode }) {
  const [createdAt] = useState(Date.now())

  window._luna_layout_id = useId()
  window._luna_site_layout_props = usePage().props

  return (
    <div>
      <span>Site Layout</span>
      <span>{createdAt}</span>
      <div>{children}</div>
    </div>
  )
}
