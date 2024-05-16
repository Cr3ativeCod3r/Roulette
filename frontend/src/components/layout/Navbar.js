import React, { useState, useEffect } from "react";
import "./nav.css";
import { useDispatch } from "react-redux";
import jwt_decode from "jwt-decode";
import { ReactComponent as Roulette } from "../../assets/images/roulette.svg";
import photo from "../../logo.png";
import photop from "../../logop.png";
import menup from "../../menu.png";
import coins from "../../coins.png";
import { Link, useNavigate } from "react-router-dom";
import { useSocket } from "../../SocketContext";


const Navbar = () => {
  const socket = useSocket();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toggleLogin, setToggleLogin] = useState(false);


  function handleLogin() {
    try {
      const popupWindow = window.open(
        import.meta.env.VITE_DOMAIN + "/auth/steam",
        "_blank",
        "width=800, height=600"
      );
      if (window.focus) popupWindow.focus();

      setToggleLogin(true);

      window.addEventListener("message", (event) => {
        if (event.origin !== import.meta.env.VITE_DOMAIN) return;
        const { token, ok } = event.data;
        window.location.reload();
        if (ok) {
          dispatch({ type: "LOGIN", payload: token });
          localStorage.setItem("jwtToken", token);
        }
      });
    } catch (error) {
      setToggleLogin(false);
      console.error("Error:", error);
    }
  }

  const logout = () => {
    localStorage.removeItem("jwtToken");
    dispatch({ type: "LOGOUT" });
    window.location.reload();
  };

  function rafto(code) {
    socket.emit("rafto", code);
  }
  function myraf(code, id) {
    socket.emit("myraf", (code, id));
  }


  let [loggedInUser, setLoggedInUser] = useState(false);
  let [id, setId] = useState(null);
  let [nick, setNick] = useState(null);
  let [avatar, setUserAvatar] = useState(null);
  let [typ, settyp] = useState(null);
  const token = localStorage.getItem("jwtToken");

  useEffect(() => {
    if (token) {
      const decodedUser = jwt_decode(token);
      const user = decodedUser.user;

      setId(user.steamId);
      setNick(user.name);
      setUserAvatar(user.avatar);
      settyp(user.usertyp);

      setLoggedInUser(decodedUser);
      console.log("DECODED");
    }
  }, [token]);

  const [toggleRegister, setToggleRegister] = useState(false);

  const showLogin = () => {
    if (toggleRegister) setToggleRegister(false);
    setToggleLogin(!toggleLogin);
  };

  const showRegister = () => {
    if (toggleLogin) setToggleLogin(false);
    setToggleRegister(!toggleRegister);
  };

  const handleRefreshCoins = () => {
    if (socket) {
      socket.emit("request-coins-update", { steamId: id });
    }
  };

  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };


  useEffect(() => {
    if (socket && loggedInUser) {
      socket.emit("update-coins", { steamId: id, newCoins: 0 });
    }
  }, [socket, loggedInUser]);

  //refresh coins

  return (
    <nav class="navbar-header" className="nav">
      <div className="leftsidenav">

        <Link className="link-logo" to="/">
          <img src={photo} className="logo" alt="CSGOdrop"></img>
          <img src={photop} className="logop" alt="CSGOdrop"></img>
        </Link>
        <ul className="nav-games">
          <li className="game">
            <Link className="navlink" to="/">
              <cw-icon className="nav-icon">
                <Roulette />
              </cw-icon>
              <span className="name">ROULETTE</span>
            </Link>
          </li>
        </ul>
      </div>
      <div className="rightsidenav">
        {loggedInUser ? (
          //PO ZALOGOWANIU
          <>
            {typ === "admin" && (
              <p className="free">
                <Link className="navlink" to="/admin">
                  Admin
                </Link>
              </p>
            )}

            <p className="free">Free Coins</p>

            <p className="free">
              <Link className="navlink" to="/deposit">
                Deposit
              </Link>
            </p>

            <p className="free">
              <Link className="navlink" to="/deposit">
                Withdraw
              </Link>
            </p>
            <button id="ref" onClick={handleRefreshCoins}>
              <i class="fa fa-refresh"></i>
            </button>
            
            <div id="coins"></div>
            <img src={coins} id="coinsp"></img>
            <img src={menup} id="menup" onClick={toggleMenu}></img>        

            <div id="profile">
              <Link className="navlink" to="/profile">
                <img className="chatphoto" id="photo" src={avatar} />
                <span className="nick">{nick}</span>
              </Link>
            </div>

            <button
              className="auth login"
              id="logout"
              onClick={() => {
                logout();
              }}
            >
              <i class="fa fa-sign-out"></i>
            </button>

      {menuVisible && (  <></> )}
       
       <div className={`${menuVisible ? 'menub' : 'menubc'}`}>
           <div id="profilef">
              <Link className="navlink" to="/profile">
                <img className="chatphoto" id="photo" src={avatar} />
                <span className="nick">{nick}</span>
              </Link>
            </div>
            <p className="nav1">
            <Link className="navlink" to="/">
              <cw-icon className="nav-icon">
                <Roulette />
              </cw-icon>
              <span className="name">ROULETTE</span>
            </Link>
            </p>
            <p className="nav1">
              <Link className="navlink" to="/deposit">
                Deposit
              </Link>
            </p>

            <p className="nav1">
              <Link className="navlink" to="/deposit">
                Withdraw
              </Link>
            </p>
            <span id="lgf">Logout</span>
            <button
              className="auth login"
              id="logoutf"
              onClick={() => {
                logout();
              }}
            >
              <i class="fa fa-sign-out"></i>
            </button>

       </div>
   
   


          </>
        ) : (
          //PO ZALOGOWANIU
          // Jeśli użytkownik nie jest zalogowany, wyświetl przyciski "Login" i "Register"
          <>
            {/* <button className="auth login" id="reg">
        <Link className="navlink" to="/Login">
          Register
        </Link>
      </button> */}
            {/* {toggleRegister ? <Register toggle={showRegister}/> : null} */}
            <div className="App">
              <img
                onClick={handleLogin}
                src="https://steamcommunity-a.akamaihd.net/public/images/signinthroughsteam/sits_01.png"
                alt="Login with Steam"
                id="steam"
              />
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
