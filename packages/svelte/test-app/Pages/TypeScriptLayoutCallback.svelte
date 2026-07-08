<script lang="ts" module>
  declare module '@laraxgram/luna' {
    export interface LunaConfig {
      sharedPageProps: {
        auth: { user: { name: string } | null }
      }
    }
  }

  import type { LayoutCallback } from '@laraxgram/svelte'
  import AppLayout from '@/Layouts/AppLayout.svelte'

  export const layout: LayoutCallback = (props) => {
    const name: string | undefined = props.auth.user?.name

    // @ts-expect-error - 'nonExistent' does not exist on shared page props
    console.log(props.nonExistent)

    return [AppLayout, { title: name }]
  }
</script>
