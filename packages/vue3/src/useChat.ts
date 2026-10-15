import { ChatClient, ChatMessage, ChatOptions, ChatSendInput, ChatStatus } from '@laraxgram/luna'
import { onUnmounted, readonly, Ref, shallowRef } from 'vue'

export interface UseChatProps {
  messages: Readonly<Ref<ChatMessage[]>>
  status: Readonly<Ref<ChatStatus>>
  error: Readonly<Ref<Error | null>>
  sendMessage: (input: string | ChatSendInput) => Promise<void>
  addToolApprovalResponse: (response: { id: string; approved: boolean; reason?: string }) => Promise<void>
  regenerate: () => Promise<void>
  stop: () => void
  setMessages: (messages: ChatMessage[] | ((messages: ChatMessage[]) => ChatMessage[])) => void
  clearError: () => void
}

export default function useChat(options: ChatOptions): UseChatProps {
  const client = new ChatClient(options)

  const messages = shallowRef(client.messages)
  const status = shallowRef(client.status)
  const error = shallowRef(client.error)

  const unsubscribe = client.subscribe(() => {
    messages.value = client.messages
    status.value = client.status
    error.value = client.error
  })

  onUnmounted(() => {
    unsubscribe()
    client.stop()
  })

  return {
    messages: readonly(messages) as Readonly<Ref<ChatMessage[]>>,
    status: readonly(status),
    error: readonly(error) as Readonly<Ref<Error | null>>,
    sendMessage: (input) => client.sendMessage(input),
    addToolApprovalResponse: (response) => client.addToolApprovalResponse(response),
    regenerate: () => client.regenerate(),
    stop: () => client.stop(),
    setMessages: (value) => client.setMessages(value),
    clearError: () => client.clearError(),
  }
}
