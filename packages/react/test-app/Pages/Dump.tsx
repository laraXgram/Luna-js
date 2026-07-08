import type { Method } from '@lunajs/core'
import { usePage } from '@lunajs/react'
import { useEffect, useMemo } from 'react'
import type { MulterFile } from '../types'

export default ({
  headers,
  method,
  form,
  query,
  url,
  files,
}: {
  headers: Record<string, string>
  method: Method
  form: Record<string, unknown>
  query: Record<string, unknown>
  url: string
  files: MulterFile[] | object
}) => {
  const page = usePage()

  const dump = useMemo(
    () => ({
      headers,
      method,
      form,
      files: files ? files : {},
      query,
      url,
      $page: page,
    }),
    [headers, method, form, files, query, url, page],
  )

  useEffect(() => {
    window._luna_request_dump = dump
  }, [dump])

  return (
    <div>
      <div className="text">This is Luna page component containing a data dump of the request</div>
      <hr />
      <pre className="dump">{JSON.stringify(dump, null, 2)}</pre>
    </div>
  )
}
