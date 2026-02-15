import { sendChatRequest } from './src/lib/ollama'

async function test() {
  try {
    console.log('Testing LLM connection...')
    const response = await sendChatRequest([
      { role: 'user', content: 'Hello, are you there?' },
    ])
    console.log('Response:', response)
  } catch (error) {
    console.error('Error:', error)
  }
}

test()
