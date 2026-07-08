import { Page } from '@lunajs/core'
import { createContext } from 'react'

const pageContext = createContext<Page | null>(null)
pageContext.displayName = 'LunaPageContext'

export default pageContext
