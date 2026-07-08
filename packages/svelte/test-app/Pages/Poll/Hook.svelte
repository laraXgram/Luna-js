<script lang="ts">
  import { luna, usePoll } from '@lunajs/svelte'

  usePoll(500, {
    only: ['custom_prop'],
    onFinish() {
      console.log('hook poll finished')
    },
  })
</script>

<a href="/" use:luna>Home</a>
