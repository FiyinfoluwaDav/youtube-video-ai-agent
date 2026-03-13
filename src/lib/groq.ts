import Groq from 'groq-sdk'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export const sendChatRequest = async (messages: ChatMessage[]) => {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is missing')
  }

  const groq = new Groq({ apiKey })

  try {
    console.log(`Sending chat request to Groq SDK`)

    const chatCompletion = await groq.chat.completions.create({
      messages: messages as any,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_completion_tokens: 4000,
      top_p: 1,
      stream: false,
    })

    return chatCompletion.choices[0]?.message?.content || ''
  } catch (error) {
    console.error('Error sending chat request to Groq:', error)
    throw error // Re-throw to be handled by caller
  }
}
