import { useAppStates } from '@/composables/states'
import { defineComponent } from 'vue'
import { open as openDialog } from '@tauri-apps/plugin-dialog'
import { join, basename } from '@tauri-apps/api/path'
import { $rc } from '@/composables/rc'
import { NButton, NDivider, useDialog, useThemeVars } from 'naive-ui'
import { AppThemeName, RcloneJobMeta } from '@/types'

export const ActionBar = defineComponent({
  setup() {
    const { theme, remote, pathStr, selection, dirty, jobMetas } = useAppStates()
    const themeVars = useThemeVars()
    const dialog = useDialog()

    async function uploadFiles() {
      if (!remote.value) return
      const files = await openDialog({ multiple: true })
      if (!files) return
      for (const file of files) {
        const filename = await basename(file)
        const meta: Omit<RcloneJobMeta, 'id'> = {
          type: 'upload',
          remote: remote.value,
          pathStr: pathStr.value,
          name: filename,
        }
        const { jobid } = await $rc<{ jobid: number }>('operations/copyfile', {
          _async: true,
          srcFs: '/',
          srcRemote: file,
          dstFs: remote.value + ':',
          dstRemote: pathStr.value + '/' + filename,
        })
        jobMetas.value.add({ id: jobid, ...meta })
      }
    }

    async function downloadSelection() {
      if (!remote.value) return
      const savePath = await openDialog({ directory: true })
      if (!savePath) return
      for (const dirent of selection.value) {
        const destPath = await join(savePath, dirent.Name)
        const meta: Omit<RcloneJobMeta, 'id'> = {
          type: 'download',
          remote: remote.value,
          pathStr: pathStr.value,
          name: dirent.Name,
        }
        if (dirent.IsDir) {
          const { jobid } = await $rc<{ jobid: number }>('sync/copy', {
            _async: true,
            srcFs: remote.value + ':' + pathStr.value + '/' + dirent.Name,
            dstFs: destPath,
          })
          jobMetas.value.add({ id: jobid, ...meta })
        } else {
          const { jobid } = await $rc<{ jobid: number }>('operations/copyfile', {
            _async: true,
            srcFs: remote.value + ':',
            srcRemote: pathStr.value + '/' + dirent.Name,
            dstFs: '/',
            dstRemote: destPath,
          })
          jobMetas.value.add({ id: jobid, ...meta })
        }
      }
    }

    async function deleteSelection() {
      if (!remote.value) return
      const reactive = dialog.error({
        showIcon: false,
        title: 'Delete selected items',
        content: `Are you sure to delete ${selection.value.length} selected items? This action cannot be undone.`,
        positiveText: 'Delete',
        negativeText: 'Cancel',
        autoFocus: false,
        async onPositiveClick() {
          reactive.loading = true
          for (const dirent of selection.value) {
            await $rc(dirent.IsDir ? 'operations/purge' : 'operations/deletefile', {
              fs: remote.value + ':',
              remote: pathStr.value + '/' + dirent.Name,
            })
          }
          reactive.loading = false
          dirty.value = true
        },
      })
    }

    return () => (
      <div class="flex p-2 gap-2 b-b b-solid" style={{ borderColor: themeVars.value.dividerColor }}>
        <NButton
          size="small"
          onClick={() => {
            const themeOrder: AppThemeName[] = ['dark', 'light']
            theme.value = themeOrder[(themeOrder.indexOf(theme.value) + 1) % themeOrder.length]
          }}
        >
          {{
            icon: () => (
              <div
                class={
                  theme.value === 'light'
                    ? 'i-material-symbols-dark-mode'
                    : 'i-material-symbols-light-mode'
                }
              />
            ),
          }}
        </NButton>

        <div class="grow-1" />

        {remote.value && (
          <>
            {selection.value.length > 0 && (
              <>
                <NButton size="small" type="primary" onClick={downloadSelection}>
                  {{
                    icon: () => <div class="i-material-symbols-download" />,
                    default: () => 'Download',
                  }}
                </NButton>
                <NButton size="small" type="error" onClick={deleteSelection}>
                  {{
                    icon: () => <div class="i-material-symbols-delete" />,
                    default: () => 'Delete',
                  }}
                </NButton>
                <NDivider style={{ height: '100%', margin: 0 }} vertical />
              </>
            )}
            <NButton size="small" type="primary" onClick={uploadFiles}>
              {{
                icon: () => <div class="i-material-symbols-upload" />,
                default: () => 'Upload',
              }}
            </NButton>
            <NButton size="small" onClick={() => (dirty.value = true)}>
              {{ icon: () => <div class="i-material-symbols-refresh" /> }}
            </NButton>
          </>
        )}
      </div>
    )
  },
})
