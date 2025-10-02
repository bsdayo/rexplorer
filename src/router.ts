import { createMemoryHistory, createRouter, RouteRecordRaw } from 'vue-router'
import { HomePanel } from './panels/HomePanel'
import { FilesPanel } from './panels/FilesPanel'

const routes: RouteRecordRaw[] = [
  { path: '/', component: HomePanel },
  { path: '/remotes/:remote/:path*', component: FilesPanel },
]

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
})
