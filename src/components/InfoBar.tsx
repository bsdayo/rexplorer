import { $rc } from '@/composables/rc'
import { useAppStates } from '@/composables/states'
import { RcloneJob, RcloneJobMeta, RcloneJobStatus, RcloneStats } from '@/types'
import { humanizeBytes } from '@/utils'
import { NEmpty, NList, NListItem, NPopover, NProgress, useMessage, useThemeVars } from 'naive-ui'
import { defineComponent, onMounted, onUnmounted, ref } from 'vue'

export const InfoBar = defineComponent({
  setup() {
    const { direntCounter: counter, dirty, jobMetas, jobCounter } = useAppStates()
    const message = useMessage()
    const themeVars = useThemeVars()

    const jobs = ref<Map<RcloneJobMeta, RcloneJob>>(new Map())

    async function refreshJobs() {
      const finished: RcloneJobMeta[] = []
      for (const meta of jobMetas.value) {
        const status = await $rc<RcloneJobStatus>(`job/status`, { jobid: meta.id })
        if (status.finished) {
          finished.push(meta)
          message.success(
            `Job ${status.id} finished in ${Math.round(status.duration * 10) / 10} seconds`
          )
          dirty.value = true
        } else {
          const stats = await $rc<RcloneStats>(`core/stats`, { group: 'job/' + meta.id })
          jobs.value.set(meta, { status, stats })
        }
      }
      for (const meta of finished) {
        jobMetas.value.delete(meta)
        jobs.value.delete(meta)
      }
    }

    let timeout: ReturnType<typeof setInterval> | undefined = undefined
    onMounted(() => (timeout = setInterval(refreshJobs, 500)))
    onUnmounted(() => clearInterval(timeout))

    return () => (
      <div class="flex gap-2 p-2 b-t b-solid" style={{ borderColor: themeVars.value.dividerColor }}>
        <NPopover style={{ width: '400px' }}>
          {{
            trigger: () => (
              <div class="flex items-center gap-1">
                <div class="i-material-symbols-upload" /> {jobCounter.value.uploads}
                <div class="i-material-symbols-download" /> {jobCounter.value.downloads}
              </div>
            ),
            default: () =>
              jobs.value.size === 0 ? (
                <NEmpty />
              ) : (
                <NList>
                  {Array.from(jobs.value).map(([meta, job]) => {
                    return (
                      <NListItem>
                        {meta.name}: {humanizeBytes(job.stats.speed)}/s
                        <NProgress
                          type="line"
                          percentage={
                            job.stats.totalBytes > 0
                              ? Math.round((job.stats.bytes / job.stats.totalBytes) * 1000) / 10
                              : 0
                          }
                        />
                      </NListItem>
                    )
                  })}
                </NList>
              ),
          }}
        </NPopover>

        <div class="grow-1" />

        {(counter.value.dirs !== 0 || counter.value.files !== 0) && (
          <div>
            {counter.value.dirs} directories, {counter.value.files} files
          </div>
        )}
      </div>
    )
  },
})
