<script lang="ts">
  import { luna } from '@lunajs/svelte'
</script>

<div>
  <span class="text">This is the links page that demonstrates that only one visit can be active at a time</span>
  <a
    href="/sleep"
    use:luna
    oncancel={() => console.log('cancelled')}
    onstart={() => console.log('started')}
    class="visit"
  >
    Link
  </a>
</div>
