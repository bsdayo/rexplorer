import { createApp } from 'vue'
import { App } from './App.tsx'
import { router } from './router.ts'
import { invoke } from '@tauri-apps/api/core'

import './global.css'
import 'virtual:uno.css'
import { RcloneInfo } from './types.ts'
import { useAppStates } from './composables/states.ts'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

createApp(App).use(router).mount('#app')

invoke<RcloneInfo>('start_rclone_rcd').then((info) => (useAppStates().rclone.value = info))
