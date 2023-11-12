import React, { useEffect, useState } from "react";
import "./style.css";
import jwt_decode from "jwt-decode";
import { Link} from "react-router-dom";

const Admin = () => {

  let [id, setId] = useState(null);
  const [userData, setUserData] = useState([]);
  const token = localStorage.getItem("jwtToken");
  let [loggedInUser, setLoggedInUser] = useState(false);
  let [nick, setNick] = useState(null);
  let [useravatar, setUserAvatar] = useState(null);
  let [usercoins, setUserCoins] = useState(null);

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

  useEffect(() => {
    fetch("http://localhost:5000/users")
      .then((response) => response.json())
      .then((data) => {
        const userData = data;
        setUserData(userData);
      })
      .catch((error) => console.error("Error", error));
  }, [id]);

  return (
    <div id="res">
      <div id="adminp">
        <div className="configg">
          <h3 class="tit">Configuration</h3>
          <p>Edit/View Website Configuration</p>

          <Link className="navlink" to="/config">
            Edit
          </Link>
        </div>
        <div className="configg">
          <h3 class="tit">Users</h3>
          <p>Registered users (not end)</p>
          <Link className="navlink" to="/users">
            View
          </Link>
        </div>
        <div className="configg">
          <h3 class="tit">Support</h3>
          <p>Not done (response user tickets)</p>

          <Link className="navlink" to="/support">
            View
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Admin;
