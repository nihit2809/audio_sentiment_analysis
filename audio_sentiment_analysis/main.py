from fastapi import FastAPI, HTTPException

from dotenv import load_dotenv

from deepgram import DeepgramClient, PrerecordedOptions, FileSource

from openai import OpenAI
import json
import os
import base64
from typing import Dict
import uvicorn

load_dotenv()

from fastapi.middleware.cors import CORSMiddleware
 
app = FastAPI()
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", OPENAI_API_KEY))

def deepgram_transcribe(audio_data: bytes) -> str:
    audio_data = base64.b64decode(audio_data.encode('utf-8'))
    try:
        deepgram = DeepgramClient(DEEPGRAM_API_KEY)

        payload: FileSource = {
            "buffer": audio_data,
        }

        options = PrerecordedOptions(
            model="nova-2",
            smart_format=True,
            diarize=True
        )

        response = deepgram.listen.prerecorded.v("1").transcribe_file(payload, options)

        transcript = json.loads((response.to_json()))['results']['channels'][0]["alternatives"][0]['paragraphs']['transcript']
        return transcript

    except Exception as e:
        return f"Exception: {e}"

def whisper_transcribe(audio_data: bytes) -> str:
    
    return """Work in progress....
              Refer to https://www.github.com/nihit2809/audio_sentiment_analysis/deploy"""

def text_infer(transcript: str) -> str:
    content = f"""
            Return the speaker wise sentiment analysis for the text between ```,  from the 3rd person point of view in about 20 words per speaker. The Analysis should not be a summary but exactly what the speaker was feeling.
            ```
            {transcript}
            ```
            """
    response = client.chat.completions.create(
                    model="gpt-3.5-turbo-0125", #Assuming the context is not going to be greater than 128k(Close to 6.5 hours of audio based of general human assumptions.)
                    messages=[
                        {"role": "user", "content": content},
                    ],
                    temperature=0,
                )
    return response.choices[0].message.content

@app.post("/process/")
async def process_data(data: Dict[str, str]):
    try:
        data_str = data.get("data")
        start = data.get("start")
        method = data.get("method")

        if start == "AUDIO":
            if method == "DEEPGRAM":
                transcription = deepgram_transcribe(data_str)
            elif method == "WHISPER":
                transcription = whisper_transcribe(data_str)
            result = text_infer(transcription)
            return {"transcription":transcription,"result": result}
        elif start == "TEXT":
            result = text_infer(data_str)
            return {"result": result}
        else:
            raise HTTPException(status_code=400, detail="Invalid 'start' value. It should be 'AUDIO' or 'TEXT'.")

        

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
