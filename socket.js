import { setupSignalingServer } from '../../lib/signaling-server';

const SocketHandler = (req, res) => {
  if (res.socket.server.wss) {
    console.log('Socket is already running.');
  } else {
    console.log('Socket is initializing...');
    res.socket.server.wss = setupSignalingServer(res.socket.server);
  }
  res.end();
};

export default SocketHandler;
