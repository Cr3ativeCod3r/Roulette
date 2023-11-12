import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Chat from '../../components/chat/Chat';

const Layout = ({ children}) => { 
  return (
    <div>
      <Navbar/>
      {children}
      <Chat/> 
    </div>
  );
}

export default Layout;

// import React from 'react';
// import Navbar from '../../components/layout/Navbar';
// import Chat from '../../components/chat/Chat';

// const Layout = ({ children, socket }) => { // Przekazujemy gniazdo jako prop do Layout
//   return (
//     <div>
//       <Navbar  socket={socket}/>
//       {children}
//       <Chat socket={socket} /> 
//     </div>
//   );
// }

// export default Layout;