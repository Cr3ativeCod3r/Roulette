import React, { useEffect, useState } from "react";
import "./style.css";
import jwt_decode from "jwt-decode";

const Pvp = () => {
  let [loggedInUser, setLoggedInUser] = useState(false);
  let [id, setId] = useState(null);
  let [nick, setNick] = useState(null);
  let [useravatar, setUserAvatar] = useState(null);
  let [usercoins, setUserCoins] = useState(null);
  const [userData, setUserData] = useState([]);
  const [sum, setsum] = useState(null);
  const [pro, setpro] = useState(null);

  const token = localStorage.getItem("jwtToken");
  useEffect(() => {
    if (token) {
      const decodedUser = jwt_decode(token);
      const user = decodedUser.user;

      setId(user.steamId);
      setNick(user.name);
      setUserAvatar(user.avatar);

      setLoggedInUser(decodedUser);
      console.log("DECODED");
    }
  }, [token]);

  useEffect(() => {
    fetch("http://localhost:5000/api/data")
      .then((response) => response.json())
      .then((data) => {
        const userData = data.filter((item) => item.userid === id);
        setUserData(userData);
      })
      .catch((error) => console.error("error:", error));
  }, [id]);

  useEffect(() => {
    let totalSum = 0;
    let totalpro = 0;

    userData.forEach((row) => {
      totalSum += row.stake;
      totalpro += row.profit;
    });

    setpro(totalpro);
    setsum(totalSum);
  }, [userData]);

  return (
    <div id="res">
      <div id="pvp">
        <div id="infos">
          <img src={useravatar} />
          <div id="steam">
            <p>{nick}</p>
            <p class="id">{id}</p>
          </div>
          <p>
            Totalbets:<span class="resss">{sum}</span>
          </p>
          <p>
            Totalprofit:<span class="resss">{pro}</span>
          </p>
        </div>
        <div id="history">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Gameid</th>
                <th>Stake</th>
                <th>Bet</th>
                <th>Result</th>
                <th>Profit</th>
                <th>Ml</th>
              </tr>
            </thead>
            <tbody>
              {userData
                .slice()
                .reverse()
                .map((row) => (
                  <tr key={row.id} className={row.profit > 0 ? "green" : "red"}>
                    <td>{row.date}</td>
                    <td>{row.gameid}</td>
                    <td>{row.stake}</td>
                    <td>{row.bet}</td>
                    <td>{row.num}</td>
                    <td>{row.profit}</td>
                    <td>{row.ml}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Pvp;
