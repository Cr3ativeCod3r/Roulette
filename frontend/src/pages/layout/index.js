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
