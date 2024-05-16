import React, { useEffect, useState } from "react";
import "./style.css";
import jwt_decode from "jwt-decode";
import { Link, Navigate, useNavigate } from "react-router-dom";

const Admin = () => {
  let [loggedInUser, setLoggedInUser] = useState(false);
  let [id, setId] = useState(null);
  let [nick, setNick] = useState(null);
  let [useravatar, setUserAvatar] = useState(null);
  let [usercoins, setUserCoins] = useState(null);
  const [userData, setUserData] = useState([]);

  const [admin, setadmin] = useState([]);
  const [mod, setmod] = useState([]);

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
    fetch(import.meta.env.VITE_LOCALHOST+"users")
      .then((response) => response.json())
      .then((data) => {
        const admin = data.filter((item) => item.usertyp === "admin");
        const userData = data.filter((item) => item.usertyp === "user");
        const mod = data.filter((item) => item.usertyp === "mod");
        setUserData(userData);
        setadmin(admin);
        setmod(mod);
      })
      .catch((error) => console.error("Błąd pobierania danych:", error));
  }, [id]);

  const [searchText, setSearchText] = useState("");

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };

  const filteredUsers = userData.filter((row) =>
    row.name.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div id="res">
      <div id="cr1">
        <div id="allus">
          <div className="users1">
            <h3>Admins:</h3>
            {admin.map((row) => (
              <div class="player" key={row.id}>
                <img src={row.avatar} alt={row.name} />
                <label>{row.name}</label>
              </div>
            ))}
          </div>

          <div className="users1">
            <h3>Moderators:</h3>
            {mod.map((row) => (
              <div class="player" key={row.id}>
                <img src={row.avatar} alt={row.name} />
                <label>{row.name}</label>
              </div>
            ))}
          </div>

          <div className="users1">
            <h3>Users: </h3>
            <p>Find one: </p>

            <input
              type="text"
              value={searchText}
              placeholder="type name..."
              onChange={handleSearch}
            />

            {filteredUsers.map((row) => (
              <div className="player" key={row.id}>
                <img className="pht" src={row.avatar} alt={row.name} />
                <label className="phtu">{row.name}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
