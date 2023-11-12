import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
import { useSocket } from "../../../SocketContext";

import "./style.css";

const Admin = () => {
  const socket = useSocket();

  let [loggedInUser, setLoggedInUser] = useState(false);
  let [id, setId] = useState(null);
  let [nick, setNick] = useState(null);
  let [useravatar, setUserAvatar] = useState(null);
  let [usercoins, setUserCoins] = useState(null);
  const [userData, setUserData] = useState([]);

  let [max, setmax] = useState(null);
  let [min, setmin] = useState(null);
  let [delay, setd] = useState(null);
  let [timer, settimer] = useState(null);

  const token = localStorage.getItem("jwtToken");
  useEffect(() => {
    if (token) {
      const decodedUser = jwt_decode(token);
      const user = decodedUser.user;

      setId(user.steamId);
      setNick(user.name);
      setUserAvatar(user.avatar);

      setLoggedInUser(decodedUser);
    }
  }, [token]);

  const [formData, setFormData] = useState({
    chatDelay: "",
    minBet: "",
    maxBet: "",
    timer: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    socket.emit("settings", formData);

    setFormData({
      chatDelay: "",
      minBet: "",
      maxBet: "",
      timer: "",
    });
  };

  useEffect(() => {
    if (socket) {
      socket.emit("getadmin", id);
      socket.on("size", ({ max, min, chatban, resettime }) => {
        setmax(max);
        setmin(min);
        setd(chatban);
        settimer(resettime);
      });
    }
  }, [socket]);

  return (
    <div id="res">
      <div id="page">
        <div id="config">
          <form onSubmit={handleSubmit}>
            <h1 id="main">Page Config</h1>
            <div>
              <label>
                Chat Delay (s):
                <input
                  type="number"
                  name="chatDelay"
                  value={formData.chatDelay}
                  onChange={handleInputChange}
                />
                <p>Actual: {delay / 1000}s</p>
              </label>
            </div>
            <div>
              <label>
                Min Bet:
                <input
                  type="number"
                  name="minBet"
                  value={formData.minBet}
                  onChange={handleInputChange}
                />
                <p>Actual: {min} coins</p>
              </label>
            </div>
            <div>
              <label>
                Max Bet:
                <input
                  type="number"
                  name="maxBet"
                  value={formData.maxBet}
                  onChange={handleInputChange}
                />
                <p> Actual: {max} coins</p>
              </label>
            </div>
            <div>
              <label>
                Timer (s):
                <input
                  type="number"
                  name="timer"
                  value={formData.timer}
                  onChange={handleInputChange}
                />
                <p>Actual: {timer}s</p>
              </label>
            </div>
            <button id="save" type="submit">
              Save
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Admin;
