import { useState } from "react";
import Input from "./components/input";
import Chat from "./components/chat";
import "./app.css";

function App() {
  const [isloading, setIsloading] = useState(false);
  const [messages, setMessages] = useState([
    // { isUser: true, input: "audio", audio: "file" },
  ]);

  return (
    <>
      {isloading ? (
        <>
          <div className="wrapper">
            <div className="loader">
              <div className="loading one"></div>
              <div className="loading two"></div>
              <div className="loading three"></div>
              <div className="loading four"></div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
      <Chat messages={messages} />
      <Input setMessages={setMessages} setIsloading={setIsloading} />
    </>
  );
}

export default App;
