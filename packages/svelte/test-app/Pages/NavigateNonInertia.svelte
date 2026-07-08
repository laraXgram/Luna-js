<script lang="ts">
  function navigate(e: MouseEvent) {
    e.preventDefault()
    window.history.replaceState({ foo: {} }, '')
    window.location.href = '/non-luna'
  }
</script>

<div>
  <h1>Navigate Non-Luna</h1>
  <p>
    <a href="/non-luna" onclick={navigate}>Go to non-Luna page</a>
  </p>
</div>
