import React from 'react'
import {SWRConfig} from 'swr'
import {createTheme, GlobalStyle} from '@welcome-ui/core'
import {ThemeProvider, Box} from '@xstyled/styled-components'
import {isBrowser} from '../lib/ssr'

const options = {
  defaultFontFamily: 'sans-serif',
  headingFontFamily: 'serif',
}

const theme = createTheme(options)

const Layout = props => (
  <SWRConfig
    value={{
      ...(isBrowser && {
        fetch: url => fetch(url).then(r => r.json()),
      }),
    }}
  >
    <ThemeProvider theme={theme}>
      <>
        <GlobalStyle />
        <Box margin="40px" {...props} />
      </>
    </ThemeProvider>
  </SWRConfig>
)

export default Layout
