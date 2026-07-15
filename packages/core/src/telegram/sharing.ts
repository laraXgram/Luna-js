import { EmojiStatusParams, ShareStoryParams } from './types'
import { requireWebApp } from './support'
import { webApp } from './webApp'

/**
 * Promise wrappers for sharing / permission-request flows: story sharing,
 * prepared-message sharing, emoji status, contact and write-access requests.
 */

export const share = {
  /** Open the story editor with the given media (SSR-safe, fire-and-forget). */
  toStory(mediaUrl: string, params?: ShareStoryParams): void {
    webApp()?.shareToStory(mediaUrl, params)
  },
  /** Share a prepared inline message by id. Resolves whether it was sent. */
  message(messageId: string): Promise<boolean> {
    return new Promise((resolve) => requireWebApp('shareMessage').shareMessage(messageId, resolve))
  },
}

export const request = {
  writeAccess(): Promise<boolean> {
    return new Promise((resolve) => requireWebApp('requestWriteAccess').requestWriteAccess(resolve))
  },
  contact(): Promise<boolean> {
    return new Promise((resolve) => requireWebApp('requestContact').requestContact(resolve))
  },
  emojiStatusAccess(): Promise<boolean> {
    return new Promise((resolve) =>
      requireWebApp('requestEmojiStatusAccess').requestEmojiStatusAccess(resolve),
    )
  },
  chat(requestId: number): Promise<boolean> {
    return new Promise((resolve) => requireWebApp('requestChat').requestChat(requestId, resolve))
  },
}

export function setEmojiStatus(customEmojiId: string, params?: EmojiStatusParams): Promise<boolean> {
  return new Promise((resolve) =>
    requireWebApp('setEmojiStatus').setEmojiStatus(customEmojiId, params, resolve),
  )
}

export function downloadFile(params: { url: string; file_name: string }): Promise<boolean> {
  return new Promise((resolve) => requireWebApp('downloadFile').downloadFile(params, resolve))
}

export function switchInlineQuery(
  query: string,
  chooseChatTypes?: Array<'users' | 'bots' | 'groups' | 'channels'>,
): void {
  webApp()?.switchInlineQuery(query, chooseChatTypes)
}
