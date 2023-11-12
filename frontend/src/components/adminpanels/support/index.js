// import React, { useEffect, useState } from "react";
// import "./style.css";
// import jwt_decode from "jwt-decode";


// const Admin = () => {
//   let [id, setId] = useState(null);
//   const [userData, setUserData] = useState([]);

//   const token = localStorage.getItem("jwtToken");
//   useEffect(() => {
//     if (token) {
//       const decodedUser = jwt_decode(token);
//       const user = decodedUser.user;

//       setId(user.steamId);
//       setNick(user.name);
//       setUserAvatar(user.avatar);
//       setLoggedInUser(decodedUser);
     
//     }
//   }, [token]);

//   useEffect(() => {
//     fetch("http://localhost:5000/users")
//       .then((response) => response.json())
//       .then((data) => {
//         const userData = data;
//         setUserData(userData);
//       })
//       .catch((error) => console.error("Error getting data:", error));
//   }, [id]);

//   return (
//     <div id="cr">
//       <h1>In future...</h1>
//     </div>
//   );
// };

// export default Admin;
