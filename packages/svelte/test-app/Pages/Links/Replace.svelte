<script lang="ts">
  import { luna } from '@laraxgram/svelte'
</script>

<div>
  <span class="text">This is the links page that demonstrates replace on Links</span>

  <a href="/dump/get" use:luna={{ replace: true }} class="replace">[State] Replace: true</a>
  <a href="/dump/get" use:luna={{ replace: false }} class="replace-false">[State] Replace: false</a>
</div>
