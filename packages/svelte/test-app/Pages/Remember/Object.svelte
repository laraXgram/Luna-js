<script lang="ts">
  import { luna, useRemember } from '@lunajs/svelte'

  let untracked = $state('')

  const form = useRemember({
    name: '',
    remember: false,
  })
</script>

<div>
  <label>
    Full Name
    <input type="text" id="name" name="full_name" bind:value={form.name} />
  </label>
  <label>
    Remember Me
    <input type="checkbox" id="remember" name="remember" bind:checked={form.remember} />
  </label>
  <label>
    Untracked
    <input type="text" id="untracked" name="untracked" bind:value={untracked} />
  </label>

  <a href="/dump/get" use:luna class="link">Navigate away</a>
</div>
