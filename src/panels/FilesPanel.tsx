import { computed, defineComponent, HTMLAttributes, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  DataTableColumns,
  DataTableRowData,
  DataTableRowKey,
  NBreadcrumb,
  NBreadcrumbItem,
  NDataTable,
} from 'naive-ui'
import { humanizeBytes } from '../utils'
import { Icon } from '@iconify/vue'
import { mapFileIcon } from '@/icons'
import { RcloneDirent } from '@/types'
import { useRc } from '@/composables/rc'
import { useAppStates } from '@/composables/states'
import { syncRef, watchImmediate } from '@vueuse/core'
import dayjs from 'dayjs'

export const FilesPanel = defineComponent({
  setup() {
    const { remote, path, pathStr, dirents, selection, dirty } = useAppStates()

    const route = useRoute()
    const router = useRouter()

    const checkedRowKeys = ref<DataTableRowKey[]>([])

    watchImmediate(
      () => route.params,
      (params) => {
        remote.value = params.remote as string
        path.value = typeof params.path === 'string' ? [] : params.path
        checkedRowKeys.value = []
        selection.value = []
        dirty.value = false
      }
    )

    const { data, refresh } = useRc<{ list: RcloneDirent[] }>(
      'operations/list',
      computed(() => ({
        fs: remote.value + ':',
        remote: pathStr.value,
      }))
    )
    syncRef(data, dirents, {
      direction: 'ltr',
      transform: {
        ltr: (left) => left?.list || [],
      },
      immediate: true,
    })
    watch(dirty, async () => {
      if (dirty.value) await refresh()
      checkedRowKeys.value = []
      selection.value = []
      dirty.value = false
    })

    const direntColumns: DataTableColumns = [
      {
        type: 'selection',
        cellProps() {
          return {
            style: { cursor: 'auto' },
            onClick(e) {
              e.stopPropagation()
            },
          }
        },
      },
      {
        key: 'IsDir',
        width: 24,
        render(row) {
          if (row.IsDir) {
            return <div class="i-material-symbols-folder" />
          } else {
            const icon = mapFileIcon(row.Name as string)
            return <Icon icon={icon} />
          }
        },
      },
      {
        title: 'Name',
        key: 'Name',
        sorter: 'default',
      },
      {
        title: 'Size',
        key: 'Size',
        width: 100,
        render(row) {
          return <span>{row.Size === -1 ? '' : humanizeBytes(row.Size as number)}</span>
        },
        sorter(row1: DataTableRowData, row2: DataTableRowData) {
          return row1.Size - row2.Size
        },
      },
      {
        title: 'Modified',
        key: 'ModTime',
        width: 120,
        render(row: DataTableRowData) {
          return <span>{dayjs(row.ModTime).fromNow()}</span>
        },
        sorter(row1: DataTableRowData, row2: DataTableRowData) {
          return dayjs(row1.ModTime).unix() - dayjs(row2.ModTime).unix()
        },
      },
    ]

    function createRowProps(row: DataTableRowData) {
      if (row.IsDir) {
        return {
          style: { cursor: 'pointer' },
          onClick: () => {
            const newPath = path.value.concat([row.Name]).join('/')
            router.push(`/remotes/${remote.value}/${newPath}`)
          },
        } satisfies HTMLAttributes
      }
      return {}
    }

    return () => (
      <div class="h-full grid grid-rows-[auto_1fr] p-2 gap-2">
        <NBreadcrumb>
          <NBreadcrumbItem onClick={() => router.push('/remotes/' + remote.value)}>
            {remote.value}
          </NBreadcrumbItem>
          {path.value.map((dir, idx) => {
            return (
              <NBreadcrumbItem
                onClick={() => {
                  const newPath = path.value.slice(0, idx + 1).join('/')
                  router.push(`/remotes/${remote.value}/${newPath}`)
                }}
              >
                {dir}
              </NBreadcrumbItem>
            )
          })}
        </NBreadcrumb>

        <NDataTable
          size="small"
          flexHeight
          data={data.value?.list || []}
          columns={direntColumns}
          rowProps={createRowProps}
          rowKey={(row) => row.Name}
          checkedRowKeys={checkedRowKeys.value}
          onUpdateCheckedRowKeys={(rowKeys, rows) => {
            checkedRowKeys.value = rowKeys
            selection.value = rows as unknown as RcloneDirent[]
          }}
        />
      </div>
    )
  },
})
