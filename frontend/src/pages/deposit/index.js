
import React, { useEffect, useState} from 'react';
import "./style.css";
import jwt_decode from 'jwt-decode';
import axios from 'axios';

const Pvp = () => {

  let [loggedInUser, setLoggedInUser] = useState(false);
  let [id, setId] = useState(null);
  let [nick, setNick] = useState(null);
  let [useravatar, setUserAvatar] = useState(null);
  let [usercoins, setUserCoins] = useState(null);
  const [userData, setUserData] = useState([]);
  const [items, setItems] = useState([]);

  const [pricing, setPricing] = useState(null);


  const token = localStorage.getItem("jwtToken");
  useEffect(() => {
    if (token) {
      const decodedUser = jwt_decode(token);
      const user = decodedUser.user;

      setId(user.steamId);
      setNick(user.name);
      setUserAvatar(user.avatar);

      setLoggedInUser(decodedUser); // Aktualizujesz zmienną loggedInUser
      console.log("DECODED");
    }
  }, [token]);



  useEffect(() => {
    axios.get('http://localhost:5000/it') // Replace with the actual URL where your Express.js server is running
      .then(response => {
        if (response.data.success) {
          const allItems = Object.values(response.data.items_list);
          const first10Items = allItems.slice(50, 100); // Get the first 10 items
          setItems(first10Items);

        } else {
          setItems([]);
        }
      })
      .catch(error => {
        console.error('Error fetching item data:', error);
        setItems([]);
      });
  }, []);




  return (
<div id="res">
   <div id="pvp">

     <span>Trade URL</span>
     <input type="text"></input><button>Find</button>
     <span>Selected itmes value: </span><span>(min 0.5$)</span>
     <button>Deposit</button>

   
     <input type="text" placeholder='search item'></input><button>ref</button>
     
     <div>
      {items.map((item, index) => (
        <div key={index}>
          {/* <span>Name: {item.name}</span> */}
          {/* <p>Rarity: {item.rarity}</p> */}
          {/* <img src={`https://steamcommunity-a.akamaihd.net/economy/image/${item.icon_url}`} alt={item.name} /> */}
         
          {/* <p>7 Days Average: {item.price.all_time.average+"$"}</p> */}
        </div>
      ))}
       Working on...
    </div>



   </div>
</div>
);

}


export default Pvp;