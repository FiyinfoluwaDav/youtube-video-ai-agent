export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OllamaChatRequest {
  model: string
  messages: OllamaMessage[]
  stream?: boolean
}

export interface OllamaChatResponse {
  model: string
  created_at: string
  message: OllamaMessage
  done: boolean
}

export const sendChatRequest = async (messages: OllamaMessage[]) => {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434'
  const model = process.env.OLLAMA_MODEL || 'deepseek-v3.1:671b-cloud'
  const apiKey = process.env.OLLAMA_API_KEY

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  try {
    // Normalize baseUrl to remove trailing slash and /api suffixes
    const normalizedBaseUrl = baseUrl.replace(/\/$/, '').replace(/\/api$/, '')

    // Use the standard OpenAI-compatible endpoint
    const url = `${normalizedBaseUrl}/v1/chat/completions`

    console.log(`Sending chat request to: ${url} with model: ${model}`)

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        `Ollama API error: ${response.status} ${response.statusText} - ${errorText}`,
      )
      throw new Error(`Ollama API error: ${response.statusText} - ${errorText}`)
    }

    // OpenAI format response
    const data = (await response.json()) as any
    return data.choices[0].message.content
  } catch (error) {
    console.error('Error sending chat request to Ollama:', error)
    throw error // Re-throw to be handled by caller
  }
}
