import { useFormContext } from '@lunajs/react'

export default () => {
  const form = useFormContext()

  return form === undefined ? (
    <div>Correctly returns undefined when used outside a Form component</div>
  ) : (
    <div>Unexpectedly has form context</div>
  )
}
