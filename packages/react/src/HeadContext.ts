import { HeadManager } from '@lunajs/core'
import { createContext } from 'react'

const headContext = createContext<HeadManager | null>(null)
headContext.displayName = 'LunaHeadContext'

export default headContext
