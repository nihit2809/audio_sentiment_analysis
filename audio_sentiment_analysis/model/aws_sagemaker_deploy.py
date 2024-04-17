import json
import base64
import time
from pyannote.audio import Pipeline
import torch
import os
import whisper
from pydub import AudioSegment
from dotenv import load_dotenv

load_dotenv()

HUGGING_FACE_AUTH_TOKEN = os.getenv("HUGGING_FACE_AUTH_TOKEN")

def delete_files_in_tmp(type,dir):
    tmp_dir = dir
    for filename in os.listdir(tmp_dir):
        if filename.endswith(type):
            file_path = os.path.join(tmp_dir, filename)
            try:
                if os.path.isfile(file_path):
                    os.unlink(file_path)
            except Exception as e:
                print(f"Failed to delete {filename}: {e}")

def split_and_save_audio(audio_file, time_dict):
    audio = AudioSegment.from_wav(audio_file)

    k=0
    for i, (start, end) in enumerate(time_dict['time']):
        speaker = time_dict['speaker'][i]
        segment = audio[start * 1000:end * 1000]
        segment.export(f"tmp/splits/{speaker}_{k}.wav", format="wav")
        k+=1

def input_fn(request_body, request_content_type):
    if request_content_type == "application/json":
        data = json.loads(request_body)
        return data
    raise ValueError("Unsupported content type: {}".format(request_content_type))

def predict_fn(input_fn_out, model_fn_out):
    pipeline = model_fn_out["pipeline"]
    model = model_fn_out["model"]

    os.makedirs("tmp/splits",exist_ok=True)

    audio_data = base64.b64decode(input_fn_out["data"].encode('utf-8'))
    path = "tmp/test_file.wav"
    with open(path,"wb") as f:
        f.write(audio_data)

    diarization = pipeline(path)
    data = {}
    time_data = []
    speaker = []

    for i,_,j in list(diarization.itertracks(yield_label=True)):
        time_data.append((i.start,i.end))
        speaker.append(j.split("_")[-1])

    data["time"] = time_data
    data["speaker"] = speaker

    split_and_save_audio(path, data)

    output = {}
    start = time.time()
    for i in os.listdir("tmp"):
        result = model.transcribe(f"tmp/{i}",language="en")
        output[i] = result

    print("Inference Time (Sec): ",time.time()-start)

    content = ""
    for i in output.keys():
        speaks = i.split("_")[0]
        strip = speaks.lstrip('0') if speaks.lstrip('0') != "" else "0"
        transcript = output[i]['text']
        content+=f"Speaker {strip}: {transcript}\n\n"

    delete_files_in_tmp(".wav","tmp")
    delete_files_in_tmp(".wav","tmp/splits")
    return {"result": content}

def model_fn(model_dir,input_fn_out):
    model_size = input_fn_out["type"]
    pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-3.1",use_auth_token=HUGGING_FACE_AUTH_TOKEN).to(torch.device("cuda"))
    model = whisper.load_model(f"{model_dir}/{model_size}.pt",in_memory=True).to(torch.device("cuda"))

    return {
        "model": model,
        "pipeline": pipeline
    }
