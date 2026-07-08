export default () => {
  function navigate(e: React.MouseEvent) {
    e.preventDefault()
    window.history.replaceState({ foo: {} }, '')
    window.location.href = '/non-luna'
  }

  return (
    <div>
      <h1>Navigate Non-Luna</h1>
      <p>
        <a href="/non-luna" onClick={navigate}>
          Go to non-Luna page
        </a>
      </p>
    </div>
  )
}
