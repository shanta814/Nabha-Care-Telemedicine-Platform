import { useEffect, useRef, useState, useCallback } from 'react';

const STUN_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

export const useWebRTC = (roomID) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);

  const setupLocalMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices.', error);
      return null;
    }
  }, []);

  const createPeerConnection = useCallback((stream) => {
    const pc = new RTCPeerConnection(STUN_SERVERS);

    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    return pc;
  }, []);

  useEffect(() => {
    if (!roomID) return;

    const init = async () => {
      await fetch('/api/socket'); // Ensure the WebSocket server is running
      const currentStream = await setupLocalMedia();
      if (!currentStream) return;

      socketRef.current = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/?room=${roomID}`);
      
      socketRef.current.onopen = () => {
        console.log('WebSocket connected');
        peerConnectionRef.current = createPeerConnection(currentStream);
      };

      socketRef.current.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        const pc = peerConnectionRef.current;

        if (message.type === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(message.offer));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socketRef.current.send(JSON.stringify({ type: 'answer', answer }));
        } else if (message.type === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(message.answer));
        } else if (message.type === 'candidate') {
          await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
        }
      };

      // This is a simple way to have one peer initiate the call
      // A more robust solution would use a "ready" state
      setTimeout(async () => {
        if (peerConnectionRef.current) {
            const offer = await peerConnectionRef.current.createOffer();
            await peerConnectionRef.current.setLocalDescription(offer);
            socketRef.current.send(JSON.stringify({ type: 'offer', offer }));
        }
      }, 2000); // Wait for the other peer to likely be ready
    };

    init();

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
      socketRef.current?.close();
      peerConnectionRef.current?.close();
    };
  }, [roomID, setupLocalMedia, createPeerConnection]);

  return { localStream, remoteStream };
};
