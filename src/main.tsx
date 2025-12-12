import { framer } from 'framer-plugin'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

framer.showUI({
  position: 'top right',
  width: 320,
  height: 600,
  title: 'Accessibility Audit'
})

const root = createRoot(document.body)
root.render(React.createElement(App))
