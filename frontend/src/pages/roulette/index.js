import React, { useEffect, useState } from "react";
import "./style.css";
import "./rolls.css";
import "./roll.css";
import doneSound from "./done.wav";
import jwt_decode from "jwt-decode";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  useLocation,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSocket } from "../../SocketContext";
import Navbar from "../../components/layout/Navbar";

const Roulette = () => {
  const [connected, setConnected] = useState(false);
  const token = localStorage.getItem("jwtToken");
  const [coinsingame, setCoins] = useState();
  const [playersRed, setPlayersRed] = useState([]);
  const [playersBlack, setPlayersBlack] = useState([]);
  const [playersGreen, setPlayersGreen] = useState([]);
  const [color, wincolor] = useState([]);
  const [rolls, setRolls] = useState([]);
  const [isDone, setIsDone] = useState(false);
  const timer = 8000;
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);
  const [maxbets, setbet] = useState(1);
  const money = "$";
  const [colorValues, setColorValues] = useState({
    red: 0,
    black: 0,
    green: 0,
  });
  const checklast = rolls.slice(-1);
  const last10Rolls = rolls.slice(-10);
  const [tras, setani] = useState(0);

  let [loggedInUser, setLoggedInUser] = useState(false);
  let [id, setId] = useState(null);
  let [nick, setNick] = useState(null);
  let [useravatar, setUserAvatar] = useState(null);
  let [usercoins, setUserCoins] = useState(null);
  let [maxb, setmax] = useState(null);
  let [minb, setmin] = useState(null);

  const socket = useSocket();

  useEffect(() => {
    if (token) {
      const decodedUser = jwt_decode(token);
      const user = decodedUser.user;

      setId(user.steamId);
      setNick(user.name);
      // setUserCoins(user.coins);
      setUserAvatar(user.avatar);

      setLoggedInUser(decodedUser);
      console.log("DECODED");
    }
  }, [token]);

  useEffect(() => {
    if (socket && loggedInUser) {
      socket.emit("update-coins", { steamId: id, newCoins: 0 });
    }
  }, [socket, loggedInUser]);

  useEffect(() => {
    if (socket && loggedInUser) {
      socket.on("coins-updated", ({ steamId, coins }) => {
        if (loggedInUser && id === steamId && coins >= 0) {
          try {
            setUserCoins(coins);
            document.getElementById("coins").innerText = coins;
          } catch (err) {
            console.log(err);
          }
        }
      });
    }
  }, [socket, loggedInUser]);

  useEffect(() => {
    if (socket) {
      socket.emit("update", id);
      socket.on("updatecolors", (updatedColorValues) => {
        setColorValues(updatedColorValues);
      });

      socket.on("shownew", (shownewnumber, colors) => {
        setIsDone(shownewnumber);
        wincolor(colors);
      });

      socket.on("rolls", (data) => {
        setRolls(data.rolls);
      });

      socket.on("game-result", ({ currentPos, moves, go, tempgo }) => {
        roll(currentPos, moves, go, tempgo);
        setTimeout(() => {
          resetplayers();
          showlast10();
          setbet(0);
        }, timer + 1000);
      });

      socket.on("updatePlayers", (data) => {
        for (let i = 0; i < data.players.length; i++) {
          let kolor = data.players[i].color;

          if (kolor === "red") {
            setPlayersRed(
              data.players.filter((player) => player.color === "red")
            );
          } else if (kolor === "black") {
            setPlayersBlack(
              data.players.filter((player) => player.color === "black")
            );
          } else if (kolor === "green") {
            setPlayersGreen(
              data.players.filter((player) => player.color === "green")
            );
          }
        }
      });


      socket.on("updateState", ({ timeLeft }) => {
        setTimeLeft(timeLeft);
        setProgress(timeLeft * 10);
      });

      socket.on("setpos", (position) => {
        const caseElement = document.getElementById("case");
        if (caseElement) {
          caseElement.style.transition = "none";
          caseElement.style.backgroundPosition = position + "px";
        }
      });
      socket.on("size", ({ max, min }) => {
        setmax(max);
        setmin(min);
      });

      socket.on("wincoin", (id) => {
        ref2(id);
      });

  
const scrollContainer = document.querySelector('#roulette');
scrollContainer.scrollLeft = (scrollContainer.scrollWidth - scrollContainer.clientWidth) / 2;

    }
  }, [socket]);


  useEffect(() => {
    
    const handleWindowResize = () => {
      const scrollContainer = document.querySelector('#roulette');
      if (scrollContainer) {
        scrollContainer.scrollLeft = (scrollContainer.scrollWidth - scrollContainer.clientWidth) / 2;
      }
    };
    window.addEventListener('resize', handleWindowResize);
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  //FUNKCJE

  function roll(currentPos, moves, go, tempgo) {

    const caseElement = document.getElementById("case");
    //currentPos = parseInt( window.getComputedStyle(caseElement).getPropertyValue('background-position-x').slice(0, -2))
    

    if (caseElement) {
      if (document.visibilityState === "visible") {
        caseElement.style.transition = `background-position ${
          timer / 1000
        }s cubic-bezier(0.1, 0.05 , 0.01, 1)`;
        caseElement.style.backgroundPosition = `${
          currentPos - 4200 - moves * 70 + go - tempgo
        }px`;
      } else {
        caseElement.style.transition = "none";
        setTimeout(() => {
          caseElement.style.backgroundPosition = `${
            currentPos - 4200 - moves * 70 + go - tempgo
          }px`;
        }, 8000);
      }
    }
  }

  function showlast10() {
    if (rolls.length > 10) {
      rolls.splice(0, rolls.length - 10);
    }
  }

  const resetplayers = () => {
    setPlayersRed([]);
    setPlayersBlack([]);
    setPlayersGreen([]);
  };

  const handleBet = (color) => {
    const name = nick;
    const steamId = id;
    const avatar = useravatar;
    const stake = parseInt(coinsingame);
    if (usercoins > 0 && usercoins >= stake && timeLeft > 0.1) {
      socket.emit("bet", { color, name, steamId, stake, avatar })
      setTimeout(() => {
        handleRefreshCoins();
      }, 100);
      setbet(maxbets + 1);
    } else if (!loggedInUser) {
      toast.error("Login first!");
    } else if (timeLeft < 0.1) {
      toast.error("Not while roling!");
    } else {
      toast.error("Not enough balance!");
    }
  };

  //ADDING COINS

  const handleminuscoins = async (take) => {
    let minus = parseInt(take);
    await socket.emit("minus-coins", { steamId: id, coinsToMinus: minus });
  };

  const handleChange = (event) => {
    const newCoinsValue = event.target.value;
    setCoins(newCoinsValue);
  };

  const handleButtonClick = (value) => {
    console.log(coinsingame);
    setCoins(parseInt(coinsingame) + parseInt(value));
  };

  const handleClearButtonClick = () => {
    setCoins(0);
  };

  const handleMaxButtonClick = () => {
    const maxCoins = usercoins;
    setCoins(maxCoins);
  };

  const handleRefreshCoins = () => {
    if (socket) {
      socket.emit("request-coins-update", { steamId: id });
    }
  };

  function ref2(player) {
    if (socket) {
      socket.emit("request-coins-update", { steamId: player });
    }
  }

  // useEffect(() => {
  //   if (isDone) {
  //   try
  //   {
  //     playSound()
  //   }catch(err)
  //   {
  //     console.log("KURWA MAC: ", err)
  //   }

  //   }
  // }, [isDone]);

  // function playSound() {
  //   const audio = new Audio(doneSound)
  //   audio.play()
  // }


  return (
    <div id="res1">
      <div id="rul">
  

        <div id="timer">
          <div className="progress-bar">
            <div className="time-left">
              {timeLeft > 0.01 ? (
                `Rolling in ${timeLeft.toFixed(0)}...`
              ) : isDone ? (
                `Roled ${checklast}!`
              ) : (
                <span id="rr">***Rolling***</span>
              )}
            </div>
            <div
              className={progress === 100 ? "start" : "progress"}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <div>
          <div id="roulette">
            <div className="wheel">
              <div id="case">
                <div id="pointer"></div>
              </div>
            </div>
          </div>
        </div>

        <div id="rolls">
         <span id="past-rolls">Past Rolls :</span> 
          {last10Rolls.map((roll, index) => {
            const rollNumber = parseInt(roll);
            let rollClass = "";

            if (rollNumber === 0) {
              rollClass = "ball-0";
            } else if (rollNumber >= 1 && rollNumber <= 7) {
              rollClass = "ball-1";
            } else if (rollNumber > 7) {
              rollClass = "ball-8";
            }

            return (
              <p className={rollClass} key={index}>
                {roll}
              </p>
            );
          })}
        </div>
        <div id="amou1">


<input

id ="am1"
  type="number"
  name="coins"
  placeholder="Enter coins"
  value={coinsingame}
  onChange={handleChange}
  step="1"
/>
<button id="clearf" onClick={handleClearButtonClick}>
              Clear
            </button>
</div>
        <div id="top">
    
        
          {loggedInUser ? (
            <>
              <div id="balance">
                <p id="ba">
                  Balance :
                  <span id="bc">
                    {" "}
                    {usercoins}
                    {money}{" "}
                  </span>
                </p>
              </div>{" "}
          
            </>
          ) : (
            <></>
          )}

          <div id="menu">
            
            <input
              type="number"
              id="amout"
              name="coins"
              value={coinsingame}
              onChange={handleChange}
              placeholder="Enter coins"
              step="1"
            />
            <button id="clear" onClick={handleClearButtonClick}>
              Clear
            </button>

            <button className="coins" onClick={() => handleButtonClick(10)}>
              +10
            </button>
            <button className="coins" onClick={() => handleButtonClick(100)}>
              +100
            </button>
            <button className="coins" onClick={() => handleButtonClick(1000)}>
              +1000
            </button>
            <button
              className="coins"
              onClick={() => handleButtonClick(-coinsingame / 2)}
            >
              1/2
            </button>
            <button
              className="coins"
              onClick={() => handleButtonClick(coinsingame)}
            >
              x2
            </button>
            <button id="max" onClick={handleMaxButtonClick}>
              Max
            </button>
          </div>
        </div>

        <div id="bot">
          <div id="players">
            <div className="botb">
              <button
                id="red"
                className="color"
                onClick={() => handleBet("red")}
              >
                Red x2
              </button>
              <div className="coutplayers">
                <p className="betp">
                  Bets:{" "}
                  {isDone && checklast >= 1 && checklast < 8 ? (
                    <span class="win">
                      +{colorValues.red * 2}
                      {money}
                    </span>
                  ) : isDone ? (
                    <span class="lose">
                      -{colorValues.red}
                      {money}
                    </span>
                  ) : (
                    <span class="idk">
                      {colorValues.red}
                      {money}
                    </span>
                  )}
                </p>
              </div>

              <div id="red-players">
                {playersRed.map((player) => (
                  <div className="better" key={player.steamId + player.color}>
                    <img
                      className="player-img"
                      src={player.avatar}
                      alt={`Avatar ${player.name}`}
                    />
                    <span className="player-name">{player.name}</span>
                    <span className="player-stake">
                      {player.stake}
                      {money}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="botb"> 
              <button
                id="green"
                className="color"
                onClick={() => handleBet("green")}
              >
                Green x14
              </button>
              <div className="coutplayers">
                <p className="betp">
                  Bets:{" "}
                  {isDone && checklast == 0 ? (
                    <span class="win">
                      +{colorValues.green * 14}
                      {money}
                    </span>
                  ) : isDone ? (
                    <span class="lose">
                      -{colorValues.green}
                      {money}
                    </span>
                  ) : (
                    <span class="idk">
                      {colorValues.green}
                      {money}
                    </span>
                  )}
                </p>
              </div>
              <div id="green-players">
                {playersGreen.map((player) => (
                  <div className="better" key={player.steamId}>
                    <img
                      className="player-img"
                      src={player.avatar}
                      alt={`Avatar ${player.name}`}
                    />
                    <span className="player-name">{player.name}</span>
                    <span className="player-stake">
                      {player.stake}
                      {money}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="botb">
              <button
                id="black"
                className="color"
                onClick={() => handleBet("black")}
              >
                Black x2
              </button>
              <div className="coutplayers">
                <p className="betp">
                  Bets:{" "}
                  {isDone && checklast > 7 ? (
                    <span class="win">
                      +{colorValues.black * 2}
                      {money}
                    </span>
                  ) : isDone ? (
                    <span class="lose">
                      -{colorValues.black}
                      {money}
                    </span>
                  ) : (
                    <span class="idk">
                      {colorValues.black}
                      {money}
                    </span>
                  )}
                </p>
              </div>
              <div id="black-players">
                {playersBlack.map((player) => (
                  <div className="better" key={player.steamId}>
                    <img
                      className="player-img"
                      src={player.avatar}
                      alt={`Avatar ${player.name}`}
                    />
                    <span className="player-name">{player.name}</span>
                    <span className="player-stake">
                      {player.stake}
                      {money}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <ToastContainer autoClose={1500} position="bottom-right" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Roulette;
