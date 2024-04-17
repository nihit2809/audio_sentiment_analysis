# Audio Level Sentiment Analysis

This repository contains code for performing audio level sentiment analysis using various technologies. It utilizes Deepgram API for audio transcription, a custom deployed Whisper model combined with pyannote for speaker diarization, and the GPT-4 API for speaker-wise sentiment analysis. Additionally, it provides a FastAPI application for easy integration into web applications.

## Features

- Transcription of audio files using Deepgram API.
- Utilization of custom deployed Whisper model for sentiment analysis (with speaker diarization) via AWS SageMaker.
- Integration with GPT-4 API for speaker-wise sentiment analysis.
- FastAPI application for running sentiment analysis locally on `localhost:8000`.

## PROJECT OVERVIEW

**Demo Video:**

[Demo Video Link](https://drive.google.com/file/d/10zrTGrIoMh0bs7Jm6hJqYLUMh3sM0nv5/view?usp=sharing)

## Folder Structure

- `model/`: Contains reference code for the custom deployed Whisper model on AWS SageMaker.
- `main.py`: FastAPI application code for running sentiment analysis.

## Setup

1. Clone the repository:

```bash
git clone https://github.com/kushwahashashank/Audio-Sentiment-Analysis-and-Summarizing-System.git
```

### Navigaing backend Folder

```bash
cd audio_sentiment_analysis
```

### Install dependencies:

```bash
pip install -r requirements.txt
```

### Obtain API keys:

- Deepgram API key
- GPT-4 API key

### Set up AWS credentials for accessing the custom deployed Whisper model on AWS SageMaker.

### Update configuration:

Update `.env` with your API keys and any other necessary configurations.

### Usage

- Run the FastAPI application:

```bash
uvicorn main:app --reload
```

- Access the application at [http://localhost:8000](http://localhost:8000) in your browser.
- Use the provided endpoints for text or audio input to get sentiment analysis results.

### Navigaing Client Folder

```bash
cd client
```

### Install dependencies:

```bash
npm install
```

### Usage

- Run the application:

```bash
npm run dev
```

- Access the application at localhost in your browser.
- Use the provided endpoints for text or audio input to get sentiment analysis results.
