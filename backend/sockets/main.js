//MAIN SOCKET FILE CONNECTION, HANDLE ROULETTE
var fs = require("fs");
var settingsRaw = fs.readFileSync("./pageconfig.json");
var settings = JSON.parse(settingsRaw);
const socketIO = require("socket.io");
const db = require("../server");

//Module exports
const updateCoins = require("./coins");
const addCoins = require("./plus");
const minusCoins = require("./minus");
const { set } = require("mongoose");

//MAIN STUFFS
const players = new Map();
const onlineUsers = new Set();
const betmap = new Map();
const chatMessages = [];
const rolls = [];
const colors = [];
const layout = [1, 14, 2, 13, 3, 12, 4, 0, 11, 5, 10, 6, 9, 7, 8];
const numWidth = 1050 / 15;

let gamers = [];
let playersByColor = [];
let historyid = 0;
let banc = new Map();

//BETHISTORY
let gameid = 0;
let stake;
let givetime = false;

//ROULETTE POSITION
let currentPos = 2;
let currentNum = 0;
let moves = 0;
let block = 1;
let go = 0;
let tempgo = 0;
let position = 2;
let num = 0;
let color = "";

//TIMER
let timeLeft = settings.rouletteTimer;
let initialTime = settings.rouletteTimer;
let progress = settings.rouletteTimer * 10;
let resettime = settings.rouletteTimer;
let resetbar = settings.rouletteTimer;

let min = settings.minimumBet;
let max = settings.maximumBet;
let chatban = settings.chatDelay * 1000;

let rollmeSet = false;
let canbet = false;
let shownewnumber = false;
let timer = 8000;


//COLORS HISTORY
var colorValues = {
  red: 0,
  black: 0,
  green: 0,
};

//WORKING ON DEPOSIT
// var TradeOfferManager = require("steam-tradeoffer-manager");
// var manager = new TradeOfferManager({
//   domain: "localhost",
//   language: "en",
//   pollInterval: 30000,
// });

//INIT IO CONNECTION
const initSocketIO = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  //START IO COINNECION-------------------------------------------------------------------------------

  io.on("connection", (socket) => {
    io.emit('rollsData', { data: "Hello from the server!" });
    socket.on("settings", (data) => {
      if (data.minBet) {
        min = data.minBet;
      }
      if (data.maxBet) {
        max = data.maxBet;
      }
      if (data.chatDelay) {
        chatban = data.chatDelay * 1000;
      }
      if (data.timer) {
        timeLeft = data.timer;
        initialTime = data.timer;
        progress = data.timer * 10;
        resettime = data.timer;
        resetbar = data.timer * 10;
      }
      io.emit("size", { max, min, chatban, resettime });
    });

    console.log(`New user connect`);

    socket.on("disconnect", () => {
      onlineUsers.delete(socket.id);
      io.emit("online-users", { onlineUsers: onlineUsers.size });
      console.log(`Client ${socket.id} left`);
    });

    //CHAT HANDLE------------------------------------------------------------------------------------------

    socket.emit("chat-history", chatMessages);
    onlineUsers.add(socket.id);
    io.emit("online-users", { onlineUsers: onlineUsers.size });

    socket.on("send-message", async (message, steamId, nick) => {
      if (!banc.has(steamId)) {
        banc.set(steamId, 0);
      }
      const sql = "SELECT canchat FROM users WHERE steamId = ?";

      db.query(sql, [steamId], (error, results) => {
        if (error) {
          console.error("Error:", error);
          return;
        }

        if (
          results.length > 0 &&
          results[0].canchat === 1 &&
          banc.get(steamId) === 0
        ) {
          banc.set(steamId, chatban);

          setTimeout(() => {
            banc.set(steamId, 0);
          }, chatban);

          chatMessages.push(message);
          if (chatMessages.length > 100) {
            chatMessages.shift();
          }

          if (
            message.user.user.usertyp === "admin" &&
            (message.text.startsWith("/mute") ||
              message.text.startsWith("/unmute") ||
              message.text.startsWith("/coins"))
          ) {
            let update;

            const parts = message.text.split(" ");
            const nick = parts[1];
            const coins = parts[2];

            if (message.text.startsWith("/mute")) {
              update = `UPDATE users SET canchat = 0 WHERE name = '${nick}'`;
              io.emit("receive-message", message);
            }
            if (message.text.startsWith("/unmute")) {
              update = `UPDATE users SET canchat = 1 WHERE name = '${nick}'`;
              io.emit("receive-message", message);
            }
            if (message.text.startsWith("/coins")) {
              update = `UPDATE users SET coins = '${coins}' WHERE name = '${nick}'`;
              const userid = `SELECT steamId FROM users WHERE name = '${nick}'`;

              db.query(userid, (err, results) => {
                if (err) {
                  console.log("no user");
                }
                const newid = results[0].steamId;
                io.emit("coinsmessage", message, newid);
              });
            }

            db.query(update)

          } else {
            if (
              message.user.user.usertyp === "user" &&
              (message.text.startsWith("/mute") ||
                message.text.startsWith("/unmute") ||
                message.text.startsWith("/coins"))
            ) {
              io.to(socket.id).emit("notify", `Its Admin command!`);
            } else {
              io.emit("receive-message", message);
            }
          }
        } else if (banc.get(steamId) != 0) {
          io.to(socket.id).emit("notify", `Chat delay ${chatban / 1000}s`);
        } else {
          io.to(socket.id).emit("notify", `You have chat ban!`);
        }
      });
    });

    socket.on("join-room", (room, cb) => {
      socket.join(room);
      cb(`Joined room ${room}`);
    });

    //CHAT HANDLE-----------------------------------------------------------------------------------

    //HANDLE COINS--------------------------------------------------------------------------------------

    socket.on("update-coins", ({ steamId, newCoins }) => {
      updateCoins(socket, steamId, newCoins);
    });

    socket.on("add-coins", async ({ steamId, coinsToAdd }) => {
      try {
        await addCoins(socket, steamId, coinsToAdd);
        socket.emit("request-coins-update", { steamId });
      } catch (error) {
        console.error(
          `Adding ${coinsToAdd} to ${steamId} error:`, error
        );
      }
    });

    function minusc(steamId, coinsToMinus) {
      const sqlSelect = "SELECT maxbets FROM users WHERE steamId = ?";

      db.query(sqlSelect, [steamId], (error, results) => {
        if (error) {
          console.error("Błąd odczytu danych z bazy danych:", error);
          return;
        }

        if (results.length > 0 && results[0].maxbets < 2) {
          const sqlUpdate =
            "UPDATE users SET maxbets = maxbets + 1 WHERE steamId = ?";

          db.query(sqlUpdate, [steamId], (error, updateResults) => {
            if (error) {
              console.error("Błąd aktualizacji danych w bazie danych:", error);
              return;
            }

            minusCoins(socket, steamId, coinsToMinus, block);
          });
        } else {
          io.to(socket.id).emit("notify", "Max 2 bets!");
        }
      });
    }

    //HANDLE COINS UPDATE BY BUTTON

    socket.on("request-coins-update", ({ steamId }) => {
      const sql = "SELECT steamId, coins FROM users WHERE steamId = ?";
      db.query(sql, [steamId], (err, results) => {
        if (err) {
          console.error("Błąd podczas żądania aktualizacji monet:", error);
        } else {
          const user = results[0]; 
          if (user) {
            socket.emit("coins-updated", {
              steamId: user.steamId,
              coins: user.coins,
            });
          } else {
            console.log("ERROR NO USER");
          }
        }
      });
    });

    //HANDLE COINS--------------------------------------------------------------------------------------

    //ROULETTE----------------------------------------------------------------------------

    socket.on("bet", (data) => {
      if (canbet && data.stake >= min && data.stake <= max) {
        const { color, name, steamId, stake, avatar } = data;
        minusc(data.steamId, data.stake);
        const formattedDate = new Date();
        const currentDate = formattedDate
          .toISOString()
          .slice(0, 16)
          .replace("T", " ");

        if (!players.has(steamId)) {
          players.set(steamId, {
            bets: [],
            name,
            avatar,
            maxBets: 2,
          });
        }

        betmap.set((historyid += 1), {
          steamId,
          currentDate,
          bets: [],
          gameid,
          stake,
          ml: [],
          result: "",
          profit: "",
        });

        //totalwinup
        const updateQuery =
          "UPDATE users SET totalwin = totalwin +? WHERE steamId = ?";

        db.query(updateQuery, [stake, steamId], (error, results) => {
          if (error) {
            console.error("Błąd zapytania:", error);
          } else {
            console.log("Zaktualizowano rekordy.");
          }
        });
        //totalwinup

        const history = betmap.get(historyid);
        history.bets.push(color);

        if (color === "black" || color === "red") {
          history.ml.push("2x");
        } else {
          history.ml.push("14x");
        }

        const playerData = players.get(steamId);

        if (playerData.bets.length >= playerData.maxBets) {
          //MAX 2 BETS
          return;
        }

        playerData.bets.push({ color, stake });

        //SAVE TO DATABASE

        db.query(
          "SELECT steamId, name, avatar FROM users WHERE steamId = ?",
          [steamId],
          (error, results) => {
            if (error) {
              console.error(
                "Błąd odczytu danych użytkownika z bazy danych:",
                error
              );
              return;
            }

            const userData = results[0];

            if (!userData) {
              console.error(
                "Użytkownik o steamId",
                steamId,
                "nie istnieje w bazie danych."
              );
              return;
            }
          }
        );

        switch (color) {
          case "red":
            colorValues.red += stake;

            break;
          case "black":
            colorValues.black += stake;

            break;
          case "green":
            colorValues.green += stake;

            break;
          default:
            break;
        }

        const newGamer = {
          color,
          name,
          steamId,
          stake,
          avatar,
        };

        gamers.push(newGamer);

        io.emit("updatecolors", colorValues);
        io.emit("updatePlayers", { players: gamers }, () => {
          console.log("NEW LOG: ", { players: gamers });
        });
      } else if (data.stake < min || data.stake > max) {
        io.to(socket.id).emit("notify", `Bet beetween ${min}-${max} `);
      } else {
        io.to(socket.id).emit("notify", `Not while rolling`);
      }
    });

    //HANDLE LAST 100
    socket.on("getlast100", (id) => {
      console.log("need me")
      sql = "SELECT " +
      "SUM(CASE WHEN colour = 'red' THEN 1 ELSE 0 END) AS red_count, " +
      "SUM(CASE WHEN colour = 'green' THEN 1 ELSE 0 END) AS green_count, " +
      "SUM(CASE WHEN colour = 'black' THEN 1 ELSE 0 END) AS black_count " +
      "FROM (SELECT * FROM rolls ORDER BY id DESC LIMIT 100) AS subquery;";


  
      db.query(sql, (err, results) => {
          try {
              let red = results[0].red_count;
              let black = results[0].black_count;
              let green = results[0].green_count; 
              console.log(red,black,green)
  
              socket.emit("last100", { red, black, green });
          } catch (err) {
              console.log("error loading history:", err);
          }
      });
  });
  

    //HANDLE POSITION

    //PAGE VISITOR SET DATA ---------------------------------------------------------

    io.emit("initialState", { timeLeft, progress });
    io.emit("shownew", shownewnumber);
    io.emit("size", { max, min, chatban, resettime });

    socket.on("update", (id) => {
      io.emit("rolls", { rolls });
      io.emit("setpos", position);
      io.emit("updatePlayers", { players: gamers });
      io.emit("updatecolors", colorValues);
    });

    socket.on("getadmin", (id) => {
      io.to(socket.id).emit("size", { max, min, chatban, resettime });
    });

    //HANDLE DEPOSIT WORKING ON !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // socket.on('deposit', function (item) {
    //   if(users[socket.id] != null)
    //   {
    //     io.sockets.to(socket.id).emit('attemptingDeposit', item);
    //     var prices = JSON.parse(fs.readFileSync('html/api/prices.json').toString());
    //     var inventory = JSON.parse(fs.readFileSync('html/cache/'+users[socket.id].steamid).toString());
    //     var classID = inventory['rgInventory'][item]['classid'];
    //     var instanceID = inventory['rgInventory'][item]['instanceid'];
    //     var combined = classID + '_' + instanceID;
    //     var itemDescription = inventory['rgDescriptions'][combined];

    //     console.log("Depositing " + itemDescription['market_hash_name']);

    //     getAccountInfo(users[socket.id].identifier, function (account) {
    //       //Sending the trade
    //       //Creating the Trade
    //       try {
    //         var offer = manager.createOffer(account.tlink);
    //       }
    //       catch (e) {
    //         console.log(e);
    //         io.sockets.to(socket.id).emit('notify', {
    //             message: "An error occured whilst sending trade offer. Please make sure your Trade URL is accurate.",
    //             time: 3500
    //           });
    //         io.sockets.to(socket.id).emit('tradeError', item);
    //         return;
    //       }
    //       //Checking escrow days
    //       offer.getUserDetails(function (err, me, them) {
    //         if (err) {
    //           console.log("An error occured whilst Checking escrow details: " + err);
    //           io.sockets.to(socket.id).emit('notify', {
    //             message: "An error occured whilst sending trade offer. Please try again later.",
    //             time: 3500
    //           });
    //           io.sockets.to(socket.id).emit('tradeError', item);
    //           return;
    //         }
    //         if (them.escrowDays == 0) {
    //           offer.setMessage("By acceppting this offer you will receive $" + prices[itemDescription['market_hash_name']] + " on site credits.");
    //           offer.addTheirItem({
    //             "assetid": item,
    //             "appid": 730,
    //             "contextid": 2
    //           });
    //           offer.data('type', 'deposit');
    //           if(users[socket.id] != null)
    //           {
    //           offer.send(function (err, status) {
    //             if (err) {
    //               console.log(err); //REMOVE LATER FOR DEBUG PURPOSES
    //               io.sockets.to(socket.id).emit('notify', {
    //                 message: "An error occured whilst sending trade offer. Please try again later.",
    //                 time: 3500
    //               });
    //               io.sockets.to(socket.id).emit('tradeError', item);
    //               return;
    //             }
    //             if (status == "sent") {
    //               if(users[socket.id] != null)
    //               {
    //                 io.sockets.to(socket.id).emit('notify', {
    //                   message: "Trade Offer Sent!",
    //                   time: 3500
    //                 });
    //                 io.sockets.to(socket.id).emit('tradeSent', item, 'http://steamcommunity.com/tradeoffer/'+offer.id);
    //                 offer = {
    //                   steamid: users[socket.id].steamid,
    //                   item: item,
    //                   type: 'deposit',
    //                   state: offer.state,
    //                   value: prices[itemDescription['market_hash_name']],
    //                   tradeofferid: offer.id
    //                 };
    //                 connection.query('INSERT INTO offers SET ?', offer);
    //               }
    //             }
    //           });
    //         }
    //         }
    //       });
    //       //END Sending the trade
    //     });
    //   }
    // });

    // manager.on('sentOfferChanged', sentOfferChanged);
    // //If the offer you sent changes
    // function sentOfferChanged(offer) {
    // 	connection.query("UPDATE offers SET state = '" + offer.state + "' WHERE tradeofferid = '" + offer.id + "'");
    // 		switch (offer.data('type')) {
    // 			case "deposit": //Deposit Trade
    // 				if(offer.state == 3) //Acceppted
    // 				{
    // 					var prices = JSON.parse(fs.readFileSync('html/api/prices.json').toString());
    // 					var marketName = offer.itemsToReceive[0].market_hash_name;
    // 					var img = offer.itemsToReceive[0].icon_url;
    // 					connection.query('UPDATE `users` SET `balance` = `balance` + '+prices[marketName]+' WHERE `steamid` = '+offer.partner);
    // 					//This is to send a notification if they acceppted the trade
    // 					if(userInfo[offer.partner] != null)
    // 					{
    // 							connection.query("SELECT * from users WHERE steamid = " + offer.partner, function(err, row) {
    // 								if (err)
    // 								{
    // 									console.log('Error while performing Query.');
    // 									return;
    // 								}
    // 								io.sockets.to(userInfo[offer.partner].socketid).emit('notify', { message: "Received Item. You have now been credited $" + prices[marketName] , time: 4500, type: "balance", data: parseFloat(row[0].balance).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")});
    // 							});
    // 					}
    // 					offer.getReceivedItems(function(err, items) {
    // 						item = {
    // 								itemid: items[0].id,
    // 								name: encodeURIComponent(marketName),
    // 								img: img,
    // 								color: '000000'
    // 						   };
    // 						connection.query('INSERT INTO market SET ?', item);
    // 					});
    // 					request({
    // 						url: secretSettings.discordWebhookURL,
    // 						json: {
    // 							"embeds": [{
    // 								"thumbnail": {
    // 									"url": "https://steamcommunity-a.akamaihd.net/economy/image/" + offer.itemsToReceive[0].icon_url
    // 								},
    // 								"color": 7584112,
    // 								"fields": [{
    // 									"name": offer.partner + " Deposited an Item!",
    // 									"value": "Worth $" + prices[marketName],
    // 									"inline": true
    // 								}]
    // 							}]
    // 						},
    // 						method: 'POST'
    // 					}, function (err, res, body) {});
    // 				}
    // 				break;
    //       }
    //     }

    //     socket.on('tradeUpdate', function (tLink) {
    //       if(users[socket.id] != null)
    //       {
    //         tradeLink = connection.escape(tLink);
    //         if(tradeLink.indexOf('https://steamcommunity.com/tradeoffer/new/?partner=') > -1)
    //         {
    //           connection.query('UPDATE `users` SET `tlink` = '+tradeLink+' WHERE `steamid` = '+users[socket.id].steamid);
    //           io.sockets.to(socket.id).emit('notify', { message: "Trade Offer URL updated.", time: 2500 });
    //         }
    //         else
    //         {
    //           io.sockets.to(socket.id).emit('notify', { message: "Please enter a valid trade URL.", time: 2500 });
    //         }
    //       }
    //     });

    //HANDLE DEPOSIT !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  });

  function machine(winningColor, num) {
    const playersWithWinningColor = Array.from(players.entries())
      .filter(([_, player]) => {
        const hasWinningColor = player.bets.some(
          (bet) => bet.color === winningColor
        );
        if (!hasWinningColor) {
        }
        return hasWinningColor;
      })
      .map(([steamId, player]) => ({
        color: winningColor,
        name: player.name,
        steamId,
        stake: player.bets
          .filter((bet) => bet.color === winningColor)
          .reduce((total, bet) => total + parseInt(bet.stake), 0),
        avatar: player.avatar,
      }));

    playersWithWinningColor.forEach((player) => {
      if (winningColor === "green") {
        player.stake *= 14;
      } else {
        player.stake *= 2;
      }
    });

    setTimeout(() => {
      winners({ players: playersWithWinningColor }, winningColor);
    }, timer);

    function randomw() {
      const min = -33;
      const max = 33;
      const losowaLiczba = Math.random();
      const wynik = Math.floor(losowaLiczba * (max - min + 1)) + min;
      return wynik;
    }

    ///ROULETTE MACHINE

    function getMoves() {
      const to = layout.indexOf(num);
      const at = layout.indexOf(currentNum);

      if (to > at) {
        return to - at;
      } else {
        return layout.length - at + to;
      }
    }

    go = randomw();
    moves = getMoves();
    io.emit("game-result", { currentPos, moves, go, tempgo });

    currentPos = currentPos - 4200 - getMoves() * 70 + go - tempgo;
    currentNum = num;
    tempgo = go;
    //visitor update
    position = currentPos;

    //reduce css position number to avoid overflow
    if (num === 0) {
      let tempposition = (currentPos + 35) % 70;
      console.log("To ta", tempposition);
      if (tempposition >= 34) {
        tempposition = tempposition + 34;
      } else {
        tempposition = tempposition + 35;
      }
      currentPos = tempposition;

      setTimeout(() => {
        io.emit("setpos", currentPos);
      }, timer);
    }

    ///ROULETTE MACHINEe

    ///UPDATE HISTORY DATABASE UHD
    for (const [historyid, betData] of betmap.entries()) {
      betData.result = winningColor;
    }

    for (const [historyid, betData] of betmap.entries()) {
      if (
        winningColor === betData.bets[0] &&
        (winningColor === "black" || winningColor === "red")
      ) {
        betData.profit = ("+", betData.stake * 2);
      }
      if (winningColor === betData.bets[0] && winningColor === "green") {
        betData.profit = ("+", betData.stake * 14);
      }
      if (winningColor != betData.bets[0]) {
        betData.profit = betData.stake * -1;
      }
    }

    betmap.forEach((data, historyid) => {
      const { steamId, currentDate, gameid, stake, bets, result, profit, ml } =
        data;

      const sql = `INSERT INTO bethistory (date, gameid, stake, bet, result, profit, userid, ml, num) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(
        sql,
        [currentDate, gameid, stake, bets, result, profit, steamId, ml, num],
        (err, results) => {
          if (err) {
            console.error(
              "Błąd podczas wstawiania danych do bazy danych:",
              err
            );
          }
        }
      );
    });

    setTimeout(() => {
      shownewnumber = true;
      rolls.push(num);
      io.emit("rolls", { rolls });
      io.emit("shownew", shownewnumber);

      //UPDTAE rolls
    const addroll = `INSERT INTO rolls (id, roll, colour) VALUES (?, ?, ?)`;
    const values = [gameid, num, winningColor];
    
    db.query(addroll, values, (err, result) => {
      if (err) {
        console.error("Błąd przy dodawaniu danych do tabeli rolls:", err);
      } 
    });
    }, timer);

    
    
  }

  //TIMER HANDLE----------------------------------------------------------------------------

  setInterval(() => {
    if (timeLeft > 0.01 && !rollmeSet) {
      if (timeLeft === resettime) {
        players.clear();
        betmap.clear();
        anit = 8;
        givetime = false;
        gamers = [];
        //RESET
        gameid += 1;
        const updateQuery = "UPDATE users SET maxbets = 0";
        db.query(updateQuery, (err, results) => {
          if (err) {
            console.error("Błąd aktualizacji danych: " + err.message);
            return;
          }
        });

        colorValues = {
          red: 0,
          black: 0,
          green: 0,
        };
        io.emit("updatecolors", colorValues);
        canbet = true;
      }
      timeLeft -= 1;
      progress = (timeLeft / initialTime) * 100;
      progress = progress.toFixed(2);
      io.emit("updateState", { timeLeft, progress });
    } else if (!rollmeSet) {
      roller();
      rollmeSet = true;
    }
  }, resettime * 100);

  function roller() {
    canbet = false;

    givetime = true;
    const winningColor = getRandomColor();
    if (winningColor == "red") num = Math.floor(Math.random() * 7) + 1;
    else if (winningColor == "black") num = Math.floor(Math.random() * 7) + 8;
    else if (winningColor == "green") num = 0;
    machine(winningColor, num);
    colors.push(winningColor);

    setTimeout(() => {
      timeLeft = resettime;
      initialTime = resettime;
      progress = resetbar;

      rollmeSet = false;
      shownewnumber = false;
      io.emit("shownew", shownewnumber, colors);
    }, timer + 1000);
  }

  function getRandomColor() {
    const colors = ["red", "black", "green"];
    const probabilities = [7 / 15, 7 / 15, 1 / 14];
    const rand = Math.random();
    let cumulativeProbability = 0;

    for (let i = 0; i < colors.length; i++) {
      cumulativeProbability += probabilities[i];
      if (rand <= cumulativeProbability) {
        return colors[i];
      }
    }
    return colors[0];
  }

  function winners(data, winningColor) {
    const { players } = data;

    if (players && players.length > 0 && players[0].color) {
      const { color: winningColor } = players[0];
      const playerWinMap = {};

      players.forEach((player) => {
        if (player.color === winningColor) {
          const winAmount = player.stake;
          playerWinMap[player.steamId] = winAmount;
        } else {
          playerWinMap[player.steamId] = 0;
        }
      });

      Object.keys(playerWinMap).forEach((steamId) => {
        const winAmount = playerWinMap[steamId];
        if (winAmount > 0) {
          let saldo;
          sql = "SELECT coins FROM users where steamId = ?";

          db.query(sql, [steamId], (err, results) => {
            if (err) {
              console.error("Błąd przy pobieraniu salda:", err);
            } else {
              saldo = results[0].coins;
              saldo += winAmount;

              const up = "UPDATE users SET coins = ? WHERE steamId = ?";
              db.query(up, [saldo, steamId], (updateErr, updateResults) => {
                if (updateErr) {
                  console.error("Błąd przy aktualizacji salda:", updateErr);
                }
                io.emit("wincoin", steamId);
              });
            }
          });
        }
      });
    }
  }

  //FUNCTIONS
  const clearOldMessages = () => {
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    while (
      chatMessages.length > 0 &&
      chatMessages[0].timestamp < tenMinutesAgo
    ) {
      chatMessages.shift();
    }
  };
  setInterval(clearOldMessages, 10 * 60 * 1000);

  return io;
};

module.exports = initSocketIO;
