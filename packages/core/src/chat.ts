import { initData } from './telegram/webApp'

export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error'

export type ChatToolState =
  | 'input-available'
  | 'approval-requested'
  | 'approval-responded'
  | 'output-available'
  | 'output-error'
  | 'output-denied'

export interface ChatTextPart {
  type: 'text' | 'reasoning'
  text: string
  state?: 'streaming' | 'done'
}

export interface ChatFilePart {
  type: 'file'
  mediaType: string
  url: string
  filename?: string
}

export interface ChatSourcePart {
  type: 'source-url'
  sourceId: string
  url: string
  title?: string
}

export interface ChatToolPart {
  type: `tool-${string}`
  toolCallId: string
  state: ChatToolState
  input?: unknown
  output?: unknown
  errorText?: string
  preliminary?: boolean
  approval?: { id: string; approved?: boolean; reason?: string | null }
}

export interface ChatStepPart {
  type: 'step-start'
}

export interface ChatCustomPart {
  type: 'custom'
  kind: string
  providerMetadata?: Record<string, unknown>
}

export type ChatMessagePart =
  | ChatTextPart
  | ChatFilePart
  | ChatSourcePart
  | ChatToolPart
  | ChatStepPart
  | ChatCustomPart

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  parts: ChatMessagePart[]
  metadata?: Record<string, unknown>
}

export interface ChatOptions {
  /** The URL of the route that streams the agent's answer. */
  api: string
  /** An identifier sent with every request, such as a conversation ID. */
  id?: string
  /** The messages the chat starts with, such as a conversation loaded from the server. */
  messages?: ChatMessage[]
  /** Extra request headers. */
  headers?: Record<string, string> | (() => Record<string, string>)
  /** Extra fields sent in the request body. */
  body?: Record<string, unknown> | (() => Record<string, unknown>)
  credentials?: RequestCredentials
  /** Send the conversation again once every pending tool approval is answered. Defaults to true. */
  sendAutomaticallyWhenApproved?: boolean
  onFinish?: (message: ChatMessage) => void
  onError?: (error: Error) => void
  onData?: (part: Record<string, unknown>) => void
}

export interface ChatSendInput {
  text?: string
  files?: File[] | FileList
}

export interface ChatState {
  messages: ChatMessage[]
  status: ChatStatus
  error: Error | null
}

function uid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function cookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'))

  return match ? decodeURIComponent(match[2]) : null
}

function lastIndexOf(parts: ChatMessagePart[], type: string): number {
  for (let index = parts.length - 1; index >= 0; index--) {
    if (parts[index].type === type) {
      return index
    }
  }

  return -1
}

function readFile(file: File): Promise<ChatFilePart> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => resolve({ type: 'file', mediaType: file.type, url: String(reader.result), filename: file.name })
    reader.onerror = () => reject(reader.error)

    reader.readAsDataURL(file)
  })
}

/**
 * A chat with an agent of the LaraGram AI SDK.
 *
 * The client speaks the UI message stream protocol that `Vercel::chat()` and
 * `usingVercelDataProtocol()` use on the server, and sends the Mini App's
 * init data so the route can authenticate the Telegram user.
 */
export class ChatClient {
  protected state: ChatState

  protected listeners = new Set<() => void>()

  protected controller: AbortController | null = null

  constructor(protected options: ChatOptions) {
    this.state = { messages: options.messages ?? [], status: 'ready', error: null }
  }

  public get messages(): ChatMessage[] {
    return this.state.messages
  }

  public get status(): ChatStatus {
    return this.state.status
  }

  public get error(): Error | null {
    return this.state.error
  }

  public getState(): ChatState {
    return this.state
  }

  public setOptions(options: Partial<ChatOptions>): void {
    this.options = { ...this.options, ...options }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener)

    return () => this.listeners.delete(listener)
  }

  /** Send a user message and stream the agent's answer. */
  public async sendMessage(input: string | ChatSendInput): Promise<void> {
    const { text = '', files = [] } = typeof input === 'string' ? { text: input } : input

    const parts: ChatMessagePart[] = await Promise.all(Array.from(files).map(readFile))

    if (text !== '') {
      parts.unshift({ type: 'text', text })
    }

    if (parts.length === 0) {
      return
    }

    this.update({ messages: [...this.state.messages, { id: uid(), role: 'user', parts }] })

    await this.submit('submit-message')
  }

  /** Answer a pending tool approval; the chat continues once every pending approval is answered. */
  public async addToolApprovalResponse({ id, approved, reason }: { id: string; approved: boolean; reason?: string }): Promise<void> {
    const messages = this.state.messages.map((message) => ({
      ...message,
      parts: message.parts.map((part) =>
        'toolCallId' in part && part.approval?.id === id
          ? { ...part, state: 'approval-responded' as const, approval: { ...part.approval, approved, reason } }
          : part,
      ),
    }))

    this.update({ messages })

    const pending = messages
      .at(-1)
      ?.parts.some((part) => 'toolCallId' in part && part.state === 'approval-requested')

    if (!pending && (this.options.sendAutomaticallyWhenApproved ?? true)) {
      await this.submit('submit-message')
    }
  }

  /** Ask the agent to answer the last user message again. */
  public async regenerate(): Promise<void> {
    const messages = [...this.state.messages]

    while (messages.length > 0 && messages.at(-1)!.role === 'assistant') {
      messages.pop()
    }

    this.update({ messages })

    await this.submit('regenerate-message')
  }

  /** Stop streaming the current answer. */
  public stop(): void {
    this.controller?.abort()
    this.controller = null

    if (this.state.status === 'streaming' || this.state.status === 'submitted') {
      this.update({ status: 'ready' })
    }
  }

  public setMessages(messages: ChatMessage[] | ((messages: ChatMessage[]) => ChatMessage[])): void {
    this.update({ messages: typeof messages === 'function' ? messages(this.state.messages) : messages })
  }

  public clearError(): void {
    this.update({ error: null, status: this.state.status === 'error' ? 'ready' : this.state.status })
  }

  protected async submit(trigger: 'submit-message' | 'regenerate-message'): Promise<void> {
    this.controller?.abort()
    this.controller = new AbortController()

    this.update({ status: 'submitted', error: null })

    try {
      const response = await fetch(this.options.api, {
        method: 'POST',
        headers: this.headers(),
        credentials: this.options.credentials ?? 'same-origin',
        signal: this.controller.signal,
        body: JSON.stringify({
          id: this.options.id,
          messages: this.state.messages,
          trigger,
          ...(typeof this.options.body === 'function' ? this.options.body() : this.options.body),
        }),
      })

      if (!response.ok || !response.body) {
        throw new Error(`The chat request failed with status ${response.status}.`)
      }

      await this.read(response.body)

      if (this.state.status !== 'error') {
        this.update({ status: 'ready' })

        const last = this.state.messages.at(-1)

        if (last?.role === 'assistant') {
          this.options.onFinish?.(last)
        }
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        return
      }

      this.update({ status: 'error', error: error as Error })
      this.options.onError?.(error as Error)
    } finally {
      this.controller = null
    }
  }

  protected headers(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      'X-Requested-With': 'XMLHttpRequest',
    }

    const xsrf = cookie('XSRF-TOKEN')

    if (xsrf) {
      headers['X-XSRF-TOKEN'] = xsrf
    }

    const telegramInitData = initData()

    if (telegramInitData) {
      headers['X-Telegram-Init-Data'] = telegramInitData
    }

    return {
      ...headers,
      ...(typeof this.options.headers === 'function' ? this.options.headers() : this.options.headers),
    }
  }

  protected async read(body: ReadableStream<Uint8Array>): Promise<void> {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        break
      }

      buffer += decoder.decode(value, { stream: true })

      let boundary: number

      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const event = buffer.slice(0, boundary)
        buffer = buffer.slice(boundary + 2)

        for (const line of event.split('\n')) {
          if (!line.startsWith('data:')) {
            continue
          }

          const data = line.slice(5).trim()

          if (data === '' || data === '[DONE]') {
            continue
          }

          try {
            this.apply(JSON.parse(data))
          } catch {
            // A malformed part is skipped rather than breaking the conversation.
          }
        }
      }
    }
  }

  protected apply(part: Record<string, any>): void {
    this.options.onData?.(part)

    if (part.type === 'error') {
      this.update({ status: 'error', error: new Error(part.errorText ?? 'An error occurred.') })

      return
    }

    const messages = [...this.state.messages]
    let message = messages.at(-1)

    if (part.type === 'start') {
      if (message?.role === 'assistant' && message.id === part.messageId) {
        return
      }

      messages.push({ id: part.messageId ?? uid(), role: 'assistant', parts: [] })
      this.update({ messages, status: 'streaming' })

      return
    }

    if (!message || message.role !== 'assistant') {
      message = { id: uid(), role: 'assistant', parts: [] }
      messages.push(message)
    }

    const parts = [...message.parts]
    const tool = (id: string) => parts.findIndex((p) => 'toolCallId' in p && p.toolCallId === id)

    switch (part.type) {
      case 'start-step':
        parts.push({ type: 'step-start' })
        break
      case 'text-start':
      case 'reasoning-start':
        parts.push({ type: part.type === 'text-start' ? 'text' : 'reasoning', text: '', state: 'streaming' })
        break
      case 'text-delta':
      case 'reasoning-delta': {
        const type = part.type === 'text-delta' ? 'text' : 'reasoning'
        const index = lastIndexOf(parts, type)

        if (index === -1) {
          parts.push({ type, text: part.delta ?? '', state: 'streaming' })
        } else {
          const current = parts[index] as ChatTextPart
          parts[index] = { ...current, text: current.text + (part.delta ?? '') }
        }
        break
      }
      case 'text-end':
      case 'reasoning-end': {
        const type = part.type === 'text-end' ? 'text' : 'reasoning'
        const index = lastIndexOf(parts, type)

        if (index !== -1) {
          parts[index] = { ...(parts[index] as ChatTextPart), state: 'done' }
        }
        break
      }
      case 'tool-input-available': {
        const next: ChatToolPart = {
          type: `tool-${part.toolName}`,
          toolCallId: part.toolCallId,
          state: 'input-available',
          input: part.input,
        }
        const index = tool(part.toolCallId)
        index === -1 ? parts.push(next) : (parts[index] = { ...(parts[index] as ChatToolPart), ...next })
        break
      }
      case 'tool-approval-request': {
        const index = tool(part.toolCallId)

        if (index !== -1) {
          parts[index] = {
            ...(parts[index] as ChatToolPart),
            state: 'approval-requested',
            approval: { id: part.approvalId ?? part.toolCallId, reason: part.reason },
          }
        }
        break
      }
      case 'tool-output-available':
      case 'tool-output-error':
      case 'tool-output-denied': {
        const index = tool(part.toolCallId)

        if (index !== -1) {
          parts[index] = {
            ...(parts[index] as ChatToolPart),
            state: part.type.replace('tool-', '') as ChatToolState,
            output: part.output,
            errorText: part.errorText,
            preliminary: part.preliminary,
          }
        }
        break
      }
      case 'source-url':
        parts.push({ type: 'source-url', sourceId: part.sourceId, url: part.url, title: part.title })
        break
      case 'custom':
        parts.push({ type: 'custom', kind: part.kind, providerMetadata: part.providerMetadata })
        break
      case 'finish':
        messages[messages.length - 1] = { ...message, parts, metadata: part.messageMetadata }
        this.update({ messages })
        return
      default:
        return
    }

    messages[messages.length - 1] = { ...message, parts }

    this.update({ messages, status: 'streaming' })
  }

  protected update(state: Partial<ChatState>): void {
    this.state = { ...this.state, ...state }

    this.listeners.forEach((listener) => listener())
  }
}
