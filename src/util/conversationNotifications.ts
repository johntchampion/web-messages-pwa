import restAPI from './rest'

type NotificationStatusResponse = { enabled: boolean }

const conversationPath = (convoId: string) => `/push/conversations/${convoId}`

export const fetchConversationNotificationsEnabled = async (
  convoId: string,
  endpoint: string,
): Promise<boolean> => {
  const response = await restAPI.get<NotificationStatusResponse>(
    conversationPath(convoId),
    { params: { endpoint } },
  )
  return response.data.enabled
}

export const setConversationNotificationsEnabled = async (
  convoId: string,
  endpoint: string,
  enabled: boolean,
): Promise<void> => {
  if (enabled) {
    await restAPI.put(conversationPath(convoId), { endpoint })
  } else {
    await restAPI.delete(conversationPath(convoId), { data: { endpoint } })
  }
}
