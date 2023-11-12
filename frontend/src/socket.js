// import { useEffect, useState } from 'react';
// import socketIOClient from 'socket.io-client';


// const useSocket = () => {
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     const initializeSocket = async () => {

//       if (socket) {
//         console.log("Zamykam stare połączenie");
//         socket.disconnect(); // Zamykanie starego połączenia
//       }
//       setSocket(null);

//       console.log('Tworzenie nowego połączenia z backendem...');
//       const newSocket = await socketIOClient(process.env.REACT_APP_BACKEND_URL)
//       setSocket(newSocket);
//       console.log('Ruletka połączona z backendem');
//     };


//     initializeSocket();

//     // Obsługa zamykania połączenia przy odmontowaniu komponentu
//     return () => {
//       if (socket) {
//         socket.disconnect();
//       }
//     };
//   }, []);

//   return socket;
// };

// export default useSocket;

import socketIOClient from 'socket.io-client';

const useSocket = socketIOClient('http://localhost:5000');

export default useSocket;