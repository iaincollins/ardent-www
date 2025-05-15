import { createContext } from 'react'

const NavigationContext = createContext()
const DialogContext = createContext()
const MaintenanceModeContext = createContext()

module.exports = {
  NavigationContext,
  DialogContext,
  MaintenanceModeContext
}
