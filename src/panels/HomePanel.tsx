import { NEmpty } from 'naive-ui'
import { defineComponent } from 'vue'

export const HomePanel = defineComponent({
  setup() {
    return () => (
      <div class="size-full flex items-center justify-center">
        <NEmpty description="Choose a remote" />
      </div>
    )
  },
})
