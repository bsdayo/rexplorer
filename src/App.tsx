import { defineComponent } from 'vue'
import {
  NConfigProvider,
  NGlobalStyle,
  NSplit,
  lightTheme,
  darkTheme,
  NLoadingBarProvider,
  NMessageProvider,
  NDialogProvider,
} from 'naive-ui'
import { RemotesPanel } from './panels/RemotesPanel.tsx'
import { RouterView } from 'vue-router'
import { ActionBar } from './components/ActionBar.tsx'
import { InfoBar } from './components/InfoBar.tsx'
import { useAppStates } from './composables/states.ts'
import { AppThemeName } from './types.ts'
import { BuiltInGlobalTheme } from 'naive-ui/es/themes/interface'

export const App = defineComponent({
  setup() {
    const { theme } = useAppStates()

    const themes: Record<AppThemeName, BuiltInGlobalTheme> = {
      light: lightTheme,
      dark: darkTheme,
    }

    return () => (
      <NConfigProvider theme={themes[theme.value]}>
        <NDialogProvider>
          <NLoadingBarProvider>
            <NMessageProvider>
              <div class="h-screen grid grid-rows-[auto_1fr_auto]">
                <ActionBar />
                <NSplit defaultSize={0.25}>
                  {{
                    1: () => <RemotesPanel />,
                    2: () => <RouterView />,
                  }}
                </NSplit>
                <InfoBar />
              </div>
            </NMessageProvider>
          </NLoadingBarProvider>
        </NDialogProvider>
        <NGlobalStyle />
      </NConfigProvider>
    )
  },
})
