/* eslint-disable react/prop-types */
import { useRef, useEffect } from "react";
// import PropTypes from "prop-types";
import "./chatpreview.css";
export const Chatpreview = ({
  messageinput,
  setMessageinput,
  submittextstring,
  setMessages,
}) => {
  const messageE = useRef(null);
  // console.log(typeof messages.length);
  // useEffect(() => {
  //   if (messageE) {
  //     messageE.current.addEventListener("DOMNodeInserted", (event) => {
  //       const { currentTarget: target } = event;
  //       target.scroll({ top: target.scrollHeight, behavior: "smooth" });
  //     });
  //   }
  // }, []);
  useEffect(() => {
    if (messageE.current) {
      messageE.current.scrollTop = messageE.current.scrollHeight;
    }
  }, [messageinput]);
  return (
    <>
      {messageinput.length > 0 ? (
        <div className="conatiner-preview">
          <div className="button-cross" onClick={() => setMessageinput([])}>
            Close
          </div>
          <div className="chat-container-preview" ref={messageE}>
            {messageinput.map((input, index) => (
              <div key={index} className="message-preview">
                <div className="bot-preview">
                  <div key={index} className="bot-response-preview">
                    <div className="left-preview">{input.currentuser} :</div>
                    <div className="right-preview">{input.message}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div
            className="button-submit"
            onClick={() => {
              submittextstring();
              setMessages((prevMessages) => [
                ...prevMessages,
                { isUser: true, input: "text", text: messageinput },
              ]);
              setMessageinput([]);
            }}
          >
            Submit
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

// Chatpreview.propTypes = {
//   messageinput: PropTypes.array,
//   setMessageinput: PropTypes.function,
//   submittextstring: PropTypes.function,
//   setMessages:PropTypes.function,
// };
