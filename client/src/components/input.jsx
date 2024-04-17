/* eslint-disable react/prop-types */
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCircleArrowUp, FaArrowUp } from "react-icons/fa6";
import { useRef, useLayoutEffect, useState, useEffect } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { FaPlay, FaPause } from "react-icons/fa";
import { LuUpload } from "react-icons/lu";
import { useReactMediaRecorder } from "react-media-recorder";
import axios from "axios";
import base64 from "base64-js";
import "./input.css";
import { Chatpreview } from "./chatpreview";

function Input({ setMessages, setIsloading }) {
  // switching text and audio input
  const [inputistext, setInputistext] = useState(true);
  let audiot;
  // audio controls
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({ audio: true });

  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.createRef();

  // Current input value
  const [currentvalue, setCurrentvalue] = useState({
    currentuser: "Speaker 1",
    message: "",
  });
  const [messageinput, setMessageinput] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [usercount, setUsercount] = useState(0);
  const [usercountemp, setUsercountemp] = useState(0);
  const [audioinput, setAudioinput] = useState(null);
  // const [messagestring, setMessagestring] = useState("");

  // const [chatpreviewtext, setChatpreviewtext] = useState([]);

  const [options, setOptions] = useState([]);

  // Input control functions

  // Audio Input control functions

  const addFile = (e) => {
    const tempfile = e.target.files[0];
    var blob = new Blob([tempfile], { type: "audio/wav" });
    var blobUrl = URL.createObjectURL(blob);
    setAudioinput(blobUrl);
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (status === "stopped") {
      setAudioinput(mediaBlobUrl);
    }
  }, [mediaBlobUrl, status]);

  // Dynamically increasing height of input tag
  const textbox = useRef(null);
  function adjustHeight() {
    textbox.current.style.height = "inherit";
    textbox.current.style.height = `${textbox.current.scrollHeight}px`;
  }

  useLayoutEffect(adjustHeight, []);
  function handleKeyDown() {
    adjustHeight();
  }

  // Handling input change events

  // Text input

  function handleAdduser() {
    if (usercountemp > 0) {
      setUsercount(usercountemp);
      if (usercountemp == 1) {
        setOptions([{ value: "Speaker" }]);
      } else {
        const newArray = [];
        for (let i = 1; i <= usercountemp; i++) {
          newArray.push({ value: `Speaker ${i}` });
        }
        setOptions(newArray);
      }
    } else {
      toast.warning("Speakers can't be less than 1", {
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        // transition: Bounce,
      });
    }
  }
  function handleResetuser() {
    setUsercount(0);
    setOptions([]);
    setUsercountemp(0);
  }

  function handleselectoption(event) {
    setCurrentvalue({
      currentuser: event.target.value,
      message: "",
    });
    textbox.current.style.height = "2rem";
  }

  const handleFocus = () => {
    setIsFocused(true);
    if (usercount == 0) {
      // alert("Add user first");
      toast.warning("Add user first!", {
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  function handletextsubmit() {
    if (currentvalue.message.length == 0) {
      toast.warning("Text field can't be empty", {
        position: "top-left",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } else {
      if (usercount >= 1) {
        if (usercount == 1) {
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              isUser: true,
              input: "text",
              text: [{ currentuser: "Speaker", message: currentvalue.message }],
            },
          ]);
          audiot = `${currentvalue.currentuser}:${currentvalue.message}`;
          setCurrentvalue({
            currentuser: currentvalue.currentuser,
            message: "",
          });
          textbox.current.style.height = "2rem";

          getsentimentanalysis("TEXT");
        } else {
          setMessageinput((messageinput) => [...messageinput, currentvalue]);
          setCurrentvalue({
            currentuser: currentvalue.currentuser,
            message: "",
          });
          textbox.current.style.height = "2rem";
        }
      }
    }
  }

  function submittextstring() {
    // call api from here
    let messageString = "";
    for (var i = 0; i < messageinput.length; i++) {
      messageString =
        messageString +
        `${messageinput[i].currentuser}:${messageinput[i].message}\n\n`;
    }
    audiot = messageString;
    getsentimentanalysis("TEXT");
  }
  // api calls

  // api call middleware
  function setoutput(input) {
    const lines = input.data.result.split(/\n{1,6}/);
    const dialogue = [];
    lines.forEach((line) => {
      const [speaker, value] = line.split(":");
      const trimmedSpeaker = speaker.trim();
      const trimmedMessage = value.trim();
      dialogue.push({ speaker: trimmedSpeaker, value: trimmedMessage });
    });
    return dialogue;
  }

  // calling api
  async function getsentimentanalysis(type) {
    if (type === "AUDIO") {
      audiot = base64.fromByteArray(audioinput);
      setMessages((prevMessages) => [
        ...prevMessages,
        { isUser: true, input: "audio", playing: false, audio: audioinput },
      ]);
    }
    setIsloading(true);

    const data = {
      data: audiot,
      start: type,
      method: "DEEPGRAM",
    };

    const url = "http://localhost:8000/process/";

    // const url = "http://localhost:7000/process/";
    axios
      .post(url, data)
      .then((response) => {
        const output = setoutput(response);
        setMessages((prevMessages) => [
          ...prevMessages,
          { isUser: false, response: output },
        ]);

        setIsloading(false);
        setAudioinput(null);
      })
      .catch(() => {
        setIsloading(false);
        setAudioinput(null);
        toast.error("Unable to Process!", {
          position: "top-left",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
      });
  }

  return (
    <>
      <ToastContainer />
      <Chatpreview
        messageinput={messageinput}
        setMessageinput={setMessageinput}
        submittextstring={submittextstring}
        setMessages={setMessages}
      />
      <div className="input-conatiner">
        {inputistext ? (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column-reverse",
              }}
            >
              {usercount > 0 ? (
                <>
                  <div className="input-buttons" onClick={handleResetuser}>
                    Reset Users
                  </div>
                </>
              ) : (
                <>
                  <div className="input-buttons" onClick={handleAdduser}>
                    Add Users
                  </div>
                </>
              )}
            </div>
            {usercount > 0 ? (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column-reverse",
                  }}
                >
                  <select
                    className="select-options"
                    onChange={handleselectoption}
                  >
                    {options.map((data, index) => {
                      return (
                        <option key={index} value={data.value}>
                          {data.value}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column-reverse",
                  }}
                >
                  <input
                    className="number-input"
                    type="number"
                    placeholder="Speakers"
                    onChange={(e) => {
                      if (e.target.value > 0) {
                        setUsercountemp(e.target.value);
                      }
                    }}
                  />
                </div>
              </>
            )}
            <div
              className="input-main"
              style={
                isFocused ? { border: "1px solid rgb(141, 141, 141)" } : {}
              }
            >
              <textarea
                onFocus={handleFocus}
                onBlur={handleBlur}
                ref={textbox}
                rows={1}
                type="text"
                className="text-input"
                value={currentvalue.message}
                onChange={(e) => {
                  setCurrentvalue({
                    currentuser: currentvalue.currentuser,
                    message: e.target.value,
                  });
                  handleKeyDown();
                }}
              />
              <div className="submit" onClick={() => handletextsubmit()}>
                <FaCircleArrowUp
                  style={{ cursor: "pointer", fontSize: "1.5rem" }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Audio Input */}

            <div
              style={{
                display: "flex",
              }}
            >
              <label>
                <div className="audio-input">
                  <LuUpload />
                </div>
                <input
                  type="file"
                  onChange={addFile}
                  accept=".mp3,.flac,.m4a,.mp4,.wav,wma,.aac"
                  className="button"
                />
              </label>

              <div>
                {status === "idle" || status === "stopped" ? (
                  <div className="audio-input" onClick={startRecording}>
                    <FaMicrophone />
                  </div>
                ) : (
                  <div className="audio-input" onClick={stopRecording}>
                    <FaStop />
                  </div>
                )}
              </div>
            </div>
            <div>
              <audio
                ref={audioRef}
                src={audioinput}
                // autoPlay={isPlaying}
                onEnded={handlePlayPause}
              />
              <div>
                {audioinput ? (
                  <>
                    {!isPlaying ? (
                      <div className="audio-input" onClick={handlePlayPause}>
                        <FaPlay />
                      </div>
                    ) : (
                      <div className="audio-input" onClick={handlePlayPause}>
                        <FaPause />
                      </div>
                    )}
                  </>
                ) : (
                  <div
                    className="audio-input"
                    style={{ opacity: "0.5", cursor: "no-drop" }}
                  >
                    <FaPlay />
                  </div>
                )}
              </div>
            </div>
            <div>
              {audioinput ? (
                <>
                  <div
                    className="audio-input"
                    onClick={() => {
                      getsentimentanalysis("AUDIO");
                    }}
                  >
                    <FaArrowUp />
                  </div>
                </>
              ) : (
                <div
                  className="audio-input"
                  style={{ opacity: "0.5", cursor: "no-drop" }}
                >
                  <FaArrowUp />
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div
        className="input-buttons"
        style={{ bottom: "10%", position: "fixed", right: "2rem" }}
        onClick={() => setInputistext(!inputistext)}
      >
        {inputistext ? <>Switch to Audio</> : <>Switch to Text</>}
      </div>
    </>
  );
}

export default Input;
