import React from 'react'
import {ThemeProvider, Box} from '@xstyled/styled-components'
import {createTheme, GlobalStyle} from '@welcome-ui/core'

const options = {
  defaultFontFamily: 'sans-serif',
  headingFontFamily: 'serif',
}

const theme = createTheme(options)

const Layout = props => (
  <ThemeProvider theme={theme}>
    <>
      <GlobalStyle />
      <Box margin="40px" {...props} />
    </>
  </ThemeProvider>
)

export default Layout
