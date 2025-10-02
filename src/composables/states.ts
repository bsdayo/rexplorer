import { AppThemeName, RcloneDirent, RcloneInfo, RcloneJobMeta } from '@/types'
import { computed, ref } from 'vue'

const theme = ref<AppThemeName>('dark')
const rclone = ref<RcloneInfo>()
const remote = ref<string>()
const path = ref<string[]>([])
const pathStr = computed(() => path.value.join('/'))
const selection = ref<RcloneDirent[]>([])
const dirents = ref<RcloneDirent[]>([])
const direntCounter = computed(() => {
  let dirs = 0
  let files = 0
  for (const item of dirents.value) {
    if (item.IsDir) dirs++
    else files++
  }
  return { dirs, files }
})
const dirty = ref(false)
const jobMetas = ref<Set<RcloneJobMeta>>(new Set())
const jobCounter = computed(() => {
  let uploads = 0
  let downloads = 0
  for (const meta of jobMetas.value) {
    if (meta.type === 'upload') uploads++
    else if (meta.type === 'download') downloads++
  }
  return { uploads, downloads }
})

export function useAppStates() {
  return {
    theme,
    rclone,
    remote,
    path,
    pathStr,
    selection,
    dirents,
    direntCounter,
    dirty,
    jobMetas,
    jobCounter,
  }
}
