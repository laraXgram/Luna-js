<script lang="ts">
  import { luna } from '@lunajs/svelte'
</script>

<div class="space-y-2">
  <a use:luna href="../"> Up one level </a>

  <a use:luna href="../../method"> Up two levels and open method </a>

  <a use:luna href="../../../"> Up three levels </a>
</div>
