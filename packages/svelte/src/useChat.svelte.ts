import { ChatClient, type ChatMessage, type ChatOptions, type ChatSendInput, type ChatStatus } from '@laraxgram/luna'
import { onDestroy } from 'svelte'

export interface UseChatProps {
  readonly messages: ChatMessage[]
  readonly status: ChatStatus
  readonly error: Error | null
  sendMessage: (input: string | ChatSendInput) => Promise<void>
  addToolApprovalResponse: (response: { id: string; approved: boolean; reason?: string }) => Promise<void>
  regenerate: () => Promise<void>
  stop: () => void
  setMessages: (messages: ChatMessage[] | ((messages: ChatMessage[]) => ChatMessage[])) => void
  clearError: () => void
}

export default function useChat(options: ChatOptions): UseChatProps {
  const client = new ChatClient(options)

  const state = $state({ messages: client.messages, status: client.status, error: client.error })

  const unsubscribe = client.subscribe(() => {
    state.messages = client.messages
    state.status = client.status
    state.error = client.error
  })

  onDestroy(() => {
    unsubscribe()
    client.stop()
  })

  return {
    get messages() {
      return state.messages
    },
    get status() {
      return state.status
    },
    get error() {
      return state.error
    },
    sendMessage: (input) => client.sendMessage(input),
    addToolApprovalResponse: (response) => client.addToolApprovalResponse(response),
    regenerate: () => client.regenerate(),
    stop: () => client.stop(),
    setMessages: (messages) => client.setMessages(messages),
    clearError: () => client.clearError(),
  }
}
