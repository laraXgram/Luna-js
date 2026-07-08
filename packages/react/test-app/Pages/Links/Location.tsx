import { Link } from '@laraxgram/react'

export default () => {
  return (
    <div>
      <span className="text">This is the links page that demonstrates location visits luna-links</span>

      <Link href="/location" replace className="example">
        Location visit
      </Link>
    </div>
  )
}
