/* eslint-disable react/prop-types */
import PropTypes from "prop-types";
import { useState, useRef, useEffect } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import "./chat.css";

export default function Chat({ messages }) {
  const messageEl = useRef();
  const audioRefs = useRef([]); // Create an array to store references for each audio element
  const [isPlayingpreviews, setIsPlayingpreviews] = useState([]);

  useEffect(() => {
    // Initialize isPlayingpreviews state array
    setIsPlayingpreviews(Array(messages.length).fill(false));
  }, [messages]);

  const handlePlayPause = (index) => {
    const newIsPlayingpreviews = [...isPlayingpreviews];
    const isPlaying = newIsPlayingpreviews[index];
    if (audioRefs.current[index]) {
      if (isPlaying) {
        audioRefs.current[index].pause();
      } else {
        audioRefs.current[index].play();
      }
      newIsPlayingpreviews[index] = !isPlaying;
      setIsPlayingpreviews(newIsPlayingpreviews);
    }
  };

  useEffect(() => {
    if (messageEl.current) {
      messageEl.current.scrollTop = messageEl.current.scrollHeight;
      }
  }, [messages]);

  return (
    <div className="container">
      <div className="chat-container" ref={messageEl}>
        <div className="messages" >
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <div
                key={index}
                className={message.isUser ? "user-message" : "bot-message"}
              >
                {message.isUser ? (
                  <>
                    {message.input === "audio" ? (
                      <div className="chat-values">
                        <label
                          style={{ fontSize: "1.2rem", fontWeight: "500" }}
                          htmlFor={`audio-${index}`}
                        >
                          User :
                        </label>
                        <audio
                          ref={(el) => (audioRefs.current[index] = el)}
                          src={message.audio}
                          id={`audio-${index}`}
                          onEnded={() => handlePlayPause(index)}
                        />
                        <div
                          className="audio-chat"
                          onClick={() => handlePlayPause(index)}
                        >
                          {!isPlayingpreviews[index] ? <FaPlay /> : <FaPause />}
                        </div>
                      </div>
                    ) : (
                      <div className="user-text">
                        <label
                          style={{ fontSize: "1.2rem", fontWeight: "500" }}
                          htmlFor={`audio-${index}`}
                        >
                          User :
                        </label>
                        {message.text.map((data, dataIndex) => (
                          <div key={dataIndex} className="bot-response">
                            <div className="left">{data.currentuser} :</div>
                            <div className="right">{data.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bot">
                    <label
                      style={{ fontSize: "1.2rem", fontWeight: "500" }}
                      htmlFor={`audio-${index}`}
                    >
                      Sentiment Analysis :
                    </label>
                    {message.response.map((data, dataIndex) => (
                      <div key={dataIndex} className="bot-response">
                        <div className="left">{data.speaker} :</div>
                        <div className="right">{data.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p
              className="bot-message"
              style={{ top: "38vh", position: "fixed", left: "43vw" }}
            >
              Hello! How can I assist you?
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

Chat.PropTypes = {
  messages: PropTypes.array,
};
