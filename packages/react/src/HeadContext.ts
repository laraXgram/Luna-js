import { HeadManager } from '@laraxgram/luna'
import { createContext } from 'react'

const headContext = createContext<HeadManager | null>(null)
headContext.displayName = 'LunaHeadContext'

export default headContext
