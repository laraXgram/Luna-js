import { Link, usePage } from '@lunajs/react'
import FnSiteLayout from '@/Layouts/FnSiteLayout'

const PageB = () => {
  window._luna_page_props = usePage().props

  return (
    <div>
      <span className="text">Simple Persistent Layout - Page B</span>
      <Link href="/persistent-layouts/function-declaration/simple/page-a">Page A</Link>
    </div>
  )
}

PageB.layout = FnSiteLayout

export default PageB
