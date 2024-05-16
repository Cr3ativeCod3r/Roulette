import socketIOClient from 'socket.io-client';

const useSocket = socketIOClient(import.meta.env.VITE_DOMAIN);

export default useSocket;