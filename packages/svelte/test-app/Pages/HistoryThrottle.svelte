<script lang="ts">
  import { luna, router } from '@laraxgram/svelte'

  let callCount = $state(0)

  function triggerRapidStateUpdates() {
    for (let i = 0; i < 120; i++) {
      callCount = i + 1
      router.remember({ value: i }, `key-${i}`)
    }
  }
</script>

<div>
  <h1>History Throttle Test</h1>
  <p id="call-count">State updates: {callCount}</p>
  <button id="trigger" onclick={triggerRapidStateUpdates}>Trigger Rapid State Updates</button>
  <a id="home-link" href="/" use:luna>Go Home</a>
</div>
