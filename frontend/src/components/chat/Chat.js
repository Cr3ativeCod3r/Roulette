import React, { useState, useEffect } from "react";
import "./chat.css";
import { useSocket } from "../../SocketContext";
import jwt_decode from "jwt-decode";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Chat = () => {
  const socket = useSocket();

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(0); 
  const [isConnected, setIsConnected] = useState(false);

  let [loggedInUser, setLoggedInUser] = useState(false);
  let [id, setId] = useState(null);
  let [nick, setNick] = useState(null);

  const token = localStorage.getItem("jwtToken");
  useEffect(() => {
    if (token) {
      const decodedUser = jwt_decode(token);
      const user = decodedUser.user;

      setId(user.steamId);
      setNick(user.name);
      setLoggedInUser(decodedUser);
   
    }
  }, [token]);

  function hideInfo() {
    var infoElements = document.querySelectorAll(".info");
    infoElements.forEach(function (element) {
      element.style.display = "none";
    });
  }

  const handleRefreshCoins = (newid) => {
    if (socket) {
      socket.emit("request-coins-update", { steamId: newid });
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("notify", (message) => {
        toast.error(message);
      });

      socket.on("receive-message", (message) => {
        if (message) 
        displayMessage(message);
      });

      socket.on("coinsmessage", (message, newid) => {
        if (message) displayMessage(message);
        handleRefreshCoins(newid);
      });

      socket.on("online-users", (data) => {
        setOnlineUsers(data.onlineUsers);
      });

      socket.on("chat-history", (history) => {
        const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
        const recentMessages = history.filter(
          (message) => new Date(message.timestamp).getTime() >= tenMinutesAgo
        );

        recentMessages.forEach((message) => displayMessage(message));
      });

      socket.on("connect_error", (error) => {
        displayInfo(error.message);
      });
      socket.on("chatban", (message) => {
        displayInfo(message);
        setTimeout(function () {
          hideInfo();
        }, 2000);
      });

      socket.on("connect", () => {
        setIsConnected(true);
      });
    }
  }, [socket]);

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (loggedInUser && inputMessage.trim() !== "") {
      const newMessage = {
        text: inputMessage,
        chatdelay: "false",
        user: loggedInUser,
        timestamp: new Date().toISOString(),
      };
      socket.emit("send-message", newMessage, id, nick);
      setInputMessage("");
    } else {
      if (!loggedInUser) {
        displayInfo("Login first");

        setTimeout(function () {
          hideInfo();
        }, 1000);
      } else {
        displayInfo("Not empty");
        setTimeout(function () {
          hideInfo();
        }, 1000);
      }
    }
  };

  const displayMessage = (message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
    const messageContainer = document.getElementById("message-container");
    messageContainer.scrollTop = messageContainer.scrollHeight;
  };

  const displayInfo = (message) => {
    setMessages((prevMessages) => [...prevMessages, { info: message }]);
    const messageContainer = document.getElementById("message-container");
    messageContainer.scrollTop = messageContainer.scrollHeight;
  };

  return (
    <>
      <div id="online-users">
        {isConnected && <div id="info">Connected</div>}
        {onlineUsers} {onlineUsers === 1 ? "" : ""} online
      </div>
      <div id="message-container">
        {messages.map((message, index) => (
          <div key={index} className={message.info ? "info" : "my"}>
            {message.info ? (
              message.info
            ) : (
              <>
                <div className="user-info">
                  <img
                    className="chatphoto"
                    src={message.user.user.avatar}
                    alt={`${message.user.user.name}'s avatar`}
                  />
                  <span className="nick">{message.user.user.name}</span>
                  <span className="timestamp">
                    {new Date(message.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="message-text">{message.text}</div>
              </>
            )}
          </div>
        ))}
      </div>

      <div id="forms">
        <form id="form" onSubmit={handleMessageSubmit}>
          <input
            type="text"
            id="message-input"
            name="message"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button type="submit" id="send-button">
            <i class="material-icons">send</i>
          </button>
        </form>

        <div>
          <ToastContainer autoClose={1500} position="bottom-right" />
        </div>
      </div>
    </>
  );
};

export default Chat;
