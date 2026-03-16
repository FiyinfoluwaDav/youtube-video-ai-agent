export interface TranscriptItem {
  text: string
  offset: number
  duration: number
}

/**
 * Fetches the transcript for a YouTube video using the Apify starvibe/youtube-video-transcript actor via REST API.
 * @param videoId The 11-character YouTube video ID.
 * @returns A promise that resolves to an array of TranscriptItems.
 */
export async function fetchTranscriptFromApify(videoId: string): Promise<TranscriptItem[]> {
  const apiKey = process.env.APIFY_API_KEY

  if (!apiKey) {
    throw new Error('APIFY_API_KEY environment variable is missing')
  }

  // Example of using dynamic import as requested
  // const { ApifyClient } = await import('apify-client')
  // const client = new ApifyClient({ token: apiKey })

  try {
    console.log(`Starting Apify actor for video ID: ${videoId} via REST API`)

    // Using the synchronous run endpoint which returns dataset items directly
    const response = await fetch(
      `https://api.apify.com/v2/acts/starvibe~youtube-video-transcript/run-sync-get-dataset-items?token=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
          language: 'en',
        }),
      },
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Apify API error (${response.status}): ${errorText}`)
    }

    const items = (await response.json()) as any[]

    if (!items || items.length === 0) {
      throw new Error('No transcript items found in Apify results')
    }

    // The actor returns a single item with a 'transcript' array
    const firstItem = items[0]
    const transcript = firstItem.transcript

    if (!transcript || !Array.isArray(transcript)) {
      throw new Error('Invalid transcript format in Apify output')
    }

    // Map Apify fields to our internal TranscriptItem format
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
