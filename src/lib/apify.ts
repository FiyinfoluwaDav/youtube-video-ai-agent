import { ApifyClient } from 'apify-client'

export interface TranscriptItem {
  text: string
  offset: number
  duration: number
}

/**
 * Fetches the transcript for a YouTube video using the Apify starvibe/youtube-video-transcript actor.
 * @param videoId The 11-character YouTube video ID.
 * @returns A promise that resolves to an array of TranscriptItems.
 */
export async function fetchTranscriptFromApify(videoId: string): Promise<TranscriptItem[]> {
  const apiKey = process.env.APIFY_API_KEY

  if (!apiKey) {
    throw new Error('APIFY_API_KEY environment variable is missing')
  }

  const client = new ApifyClient({
    token: apiKey,
  })

  // Prepare the input for the actor
  const input = {
    youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
    language: 'en', // Prefer English
  }

  try {
    console.log(`Starting Apify actor for video ID: ${videoId}`)
    
    // Run the actor and wait for it to finish
    const run = await client.actor('starvibe/youtube-video-transcript').call(input)

    console.log(`Apify actor finished. Fetching results from dataset: ${run.defaultDatasetId}`)

    // Fetch the results from the run's dataset
    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    if (!items || items.length === 0) {
      throw new Error('No transcript items found in Apify results')
    }

    // The actor returns a single item with a 'transcript' array
    const firstItem = items[0] as any
    const transcript = firstItem.transcript

    if (!transcript || !Array.isArray(transcript)) {
      throw new Error('Invalid transcript format in Apify output')
    }

    // Map Apify fields to our internal TranscriptItem format
    // Apify: { text: string, start: number, duration: number, end: number }
    // Our format: { text: string, offset: number, duration: number }
    return transcript.map((item: any) => ({
      text: item.text || '',
      offset: item.start || 0,
      duration: item.duration || 0,
    }))
  } catch (error) {
    console.error('Error fetching transcript from Apify:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to fetch transcript: ${error.message}`)
    }
    throw new Error('Failed to fetch transcript: Unknown error')
  }
}
