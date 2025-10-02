import { MaybeRefOrGetter, ref, toValue } from 'vue'
import { fetch } from '@tauri-apps/plugin-http'
import { useLoadingBar, useMessage } from 'naive-ui'
import { useAppStates } from './states'
import { watchImmediate } from '@vueuse/core'

export type RcStatus = 'idle' | 'pending' | 'success' | 'error'

export async function $rc<T = Record<string, any>>(
  command: string,
  body?: MaybeRefOrGetter<Record<string, any>>
): Promise<T> {
  const { rclone } = useAppStates()
  if (!rclone.value) {
    throw new Error('rclone rcd not started')
  }

  const init: Record<string, any> = {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${rclone.value.user}:${rclone.value.pass}`)}`,
    },
  }
  if (body) {
    init.headers['Content-Type'] = 'application/json'
    init.body = JSON.stringify(toValue(body))
  }

  const res = await fetch(`http://${rclone.value.addr}/${command}`, init)
  const json = await res.json()
  if (json.error) {
    throw new Error(json.error)
  }
  return json
}

export function useRc<T = Record<string, any>>(
  command: string,
  body?: MaybeRefOrGetter<Record<string, any>>
) {
  const { rclone } = useAppStates()
  const message = useMessage()
  const loadingBar = useLoadingBar()

  const data = ref<T>()
  const status = ref<RcStatus>('idle')

  let currentRefreshTs: number | null = null

  const refresh = async () => {
    try {
      status.value = 'pending'
      loadingBar.start()
      data.value = undefined

      const ts = Date.now()
      currentRefreshTs = ts

      const json = await $rc<T>(command, body)

      // A newer refresh has been triggered, ignore this result
      if (currentRefreshTs !== ts) return

      data.value = json
      loadingBar.finish()
      status.value = 'success'
    } catch (e) {
      console.error(e)
      message.error(`${e}`, {
        closable: true,
      })
      loadingBar.error()
      status.value = 'error'
    }
  }

  watchImmediate(body ? [rclone, body] : [rclone], () => {
    if (rclone.value) {
      refresh()
    }
  })

  return {
    data,
    status,
    refresh,
  }
}
