import { ChatClient, ChatMessage, ChatOptions, ChatSendInput, ChatStatus } from '@laraxgram/luna'
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react'

export interface UseChatProps {
  messages: ChatMessage[]
  status: ChatStatus
  error: Error | null
  sendMessage: (input: string | ChatSendInput) => Promise<void>
  addToolApprovalResponse: (response: { id: string; approved: boolean; reason?: string }) => Promise<void>
  regenerate: () => Promise<void>
  stop: () => void
  setMessages: (messages: ChatMessage[] | ((messages: ChatMessage[]) => ChatMessage[])) => void
  clearError: () => void
}

export default function useChat(options: ChatOptions): UseChatProps {
  const client = useRef<ChatClient | null>(null)

  if (client.current === null) {
    client.current = new ChatClient(options)
  }

  client.current.setOptions({ ...options, messages: undefined })

  const state = useSyncExternalStore(
    useCallback((listener: () => void) => client.current!.subscribe(listener), []),
    () => client.current!.getState(),
    () => client.current!.getState(),
  )

  useEffect(() => () => client.current?.stop(), [])

  return {
    ...state,
    sendMessage: useCallback((input) => client.current!.sendMessage(input), []),
    addToolApprovalResponse: useCallback((response) => client.current!.addToolApprovalResponse(response), []),
    regenerate: useCallback(() => client.current!.regenerate(), []),
    stop: useCallback(() => client.current!.stop(), []),
    setMessages: useCallback((messages) => client.current!.setMessages(messages), []),
    clearError: useCallback(() => client.current!.clearError(), []),
  }
}
