import 'dotenv/config'

const apiKey = process.env.OLLAMA_API_KEY || ''
const model = process.env.OLLAMA_MODEL || 'deepseek-v3.1:671b-cloud'

async function testEndpoint(url: string) {
  // Normalize baseUrl to remove trailing slash and /api suffix if present
  const normalizedBaseUrl = url.replace(/\/$/, '').replace(/\/api$/, '')
  console.log(`Testing ${normalizedBaseUrl} (derived from ${url})...`)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }

  try {
    const body = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: 'Hello' }],
      stream: false,
    })
    const response = await fetch(normalizedBaseUrl + '/api/chat', {
      method: 'POST',
      headers,
      body,
    })
    console.log(
      `  [POST /api/chat] Status: ${response.status} ${response.statusText}`,
    )
    if (response.ok) console.log('  SUCCESS (/api/chat)')
  } catch (e: any) {
    console.log(`  [POST /api/chat] Error: ${e.message}`)
  }

  // Also try OpenAI compatible
  try {
    const body = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: 'Hello' }],
    })
    const response = await fetch(normalizedBaseUrl + '/v1/chat/completions', {
      method: 'POST',
      headers,
      body,
    })
    console.log(
      `  [POST /v1/chat/completions] Status: ${response.status} ${response.statusText}`,
    )
    if (response.ok) return true
  } catch (e: any) {
    console.log(`  [POST /v1/chat/completions] Error: ${e.message}`)
  }

  return false
}

async function run() {
  const baseIds = [
    'http://localhost:11434',
    'https://ollama.com',
    'https://api.ollama.com',
  ]

  console.log(`Using Key: ${apiKey.substring(0, 10)}...`)

  for (const base of baseIds) {
    await testEndpoint(base)
  }
}

run()
