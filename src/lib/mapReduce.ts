import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import pLimit from 'p-limit'
import { sendChatRequest } from './groq'

export interface TranscriptSegment {
  text: string
  offset: number
  duration: number
}

const CHAR_CHUNK_SIZE = 5000
const CHAR_CHUNK_OVERLAP = 1000
const CONCURRENCY_LIMIT = 4

export async function summarizeVideoMapReduce(
  transcript: TranscriptSegment[],
  finalPrompt: string,
): Promise<string> {
  if (!transcript || transcript.length === 0) {
    throw new Error('Transcript is empty')
  }

  // 1. Format the transcript with timestamps
  let currentMinute = -1
  const fullText = transcript
    .map((t) => {
      const min = Math.floor(t.offset / 60)
      let text = t.text
      if (min > currentMinute) {
        currentMinute = min
        text = `\n[${min}:00] ` + text
      }
      return text
    })
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

  // 2. Chunk the text
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHAR_CHUNK_SIZE,
    chunkOverlap: CHAR_CHUNK_OVERLAP,
    separators: ['\n\n', '\n', '. ', ' ', ''],
  })

  const chunks = await splitter.createDocuments([fullText])
  const chunkTexts = chunks.map((doc) => doc.pageContent)

  if (chunkTexts.length === 0) return ''

  if (chunkTexts.length === 1) {
    return runFinalSummary(chunkTexts[0], finalPrompt)
  }

  // 3. Map Phase
  const limit = pLimit(CONCURRENCY_LIMIT)
  const mapPromises = chunkTexts.map((chunk, index) =>
    limit(async () => {
      console.log(
        `[Map-Reduce] Mapping chunk ${index + 1}/${chunkTexts.length}...`,
      )
      const prompt = `You are an expert summarizer. Summarize the following segment of a video transcript. Keep key points, arguments, examples, and timestamps if relevant. Be concise.

Transcript Segment:
${chunk}`

      try {
        const response = await sendChatRequest([
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: prompt },
        ])
        return response
      } catch (err) {
        console.error(`Error mapping chunk ${index}:`, err)
        return ''
      }
    }),
  )

  const mappedSummaries = await Promise.all(mapPromises)
  const validSummaries = mappedSummaries.filter((s) => s.trim().length > 0)

  if (validSummaries.length === 0) {
    throw new Error('Map phase failed to produce any summaries.')
  }

  // 4. Reduce Phase (Hierarchical)
  let currentLevel = validSummaries
  const GROUP_SIZE = 5

  while (currentLevel.length > 1) {
    const nextLevel: string[] = []

    for (let i = 0; i < currentLevel.length; i += GROUP_SIZE) {
      const group = currentLevel.slice(i, i + GROUP_SIZE)
      const combinedText = group.join('\n\n---\n\n')

      console.log(`[Map-Reduce] Reducing group of ${group.length} summaries...`)

      if (currentLevel.length <= GROUP_SIZE) {
        const finalResult = await runFinalSummary(combinedText, finalPrompt)
        nextLevel.push(finalResult)
      } else {
        const intermediatePrompt = `Combine and summarize the following chronological summaries of a video. Keep the flow chronological and retain key points, examples, and timestamps.

Summaries:
${combinedText}`

        try {
          const res = await sendChatRequest([
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: intermediatePrompt },
          ])
          nextLevel.push(res)
        } catch (err) {
          console.error(`Error reducing group:`, err)
          nextLevel.push(combinedText) // Fallback to unsummarized
        }
      }
    }

    currentLevel = nextLevel
  }

  return currentLevel[0]
}

async function runFinalSummary(
  text: string,
  userPrompt: string,
): Promise<string> {
  const prompt = `${userPrompt}

Based on the following comprehensive chronological summaries of the video:
${text}`

  const response = await sendChatRequest([
    { role: 'system', content: 'You are a helpful and precise assistant.' },
    { role: 'user', content: prompt },
  ])

  return response
}
