import sys
import json
import re
from youtube_transcript_api import YouTubeTranscriptApi

def get_video_id(youtube_url):
    """
    Extract the video ID from a YouTube URL.
    """
    if len(youtube_url) == 11 and ' ' not in youtube_url:
        return youtube_url 

    pattern = r'(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})'
    match = re.search(pattern, youtube_url)
    return match.group(1) if match else None

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No video ID provided"}))
        sys.exit(1)

    video_input = sys.argv[1]
    video_id = get_video_id(video_input)

    if not video_id:
        print(json.dumps({"error": "Invalid video ID or URL"}))
        sys.exit(1)

    try:
        transcript_list = YouTubeTranscriptApi().list(video_id)
        
        # Try to get manual English, fallback to generated English, then any available
        try:
             transcript = transcript_list.find_manually_created_transcript(['en'])
        except:
             try:
                 transcript = transcript_list.find_generated_transcript(['en'])
             except:
                 transcript = transcript_list.find_transcript(['en'])
        
        data = transcript.fetch()

        # Map 'start' to 'offset' to match frontend expectations
        formatted_data = []
        for item in data:
            # Handle both dict and object (attribute) access
            text = item['text'] if isinstance(item, dict) else getattr(item, 'text', '')
            start = item['start'] if isinstance(item, dict) else getattr(item, 'start', 0.0)
            duration = item['duration'] if isinstance(item, dict) else getattr(item, 'duration', 0.0)
            
            formatted_data.append({
                "text": text,
                "offset": start,
                "duration": duration
            })

        print(json.dumps(formatted_data))

    except Exception as e:
        # Output error as JSON
        error_msg = str(e)
        print(json.dumps({"error": error_msg}))
        sys.exit(1)

if __name__ == "__main__":
    main()
