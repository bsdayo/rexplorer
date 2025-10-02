import { computed, defineComponent } from 'vue'
import { MenuOption, NMenu, NScrollbar } from 'naive-ui'
import { RouterLink } from 'vue-router'
import { useRc } from '@/composables/rc'

export const RemotesPanel = defineComponent({
  setup() {
    const { data } = useRc<{ remotes: string[] }>('config/listremotes')

    const menuOptions = computed(() => {
      return data.value?.remotes.map((remote) => {
        return {
          label: () => <RouterLink to={`/remotes/${remote}`}>{remote}</RouterLink>,
          key: remote,
        } satisfies MenuOption
      })
    })

    return () => (
      <NScrollbar>
        <NMenu options={menuOptions.value} />
      </NScrollbar>
    )
  },
})
