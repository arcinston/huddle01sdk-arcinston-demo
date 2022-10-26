import { useEffect, useRef, useState } from 'react';
import reactLogo from './assets/react.svg';
import './App.css';

import { HuddleClientProvider, getHuddleClient, useRootStore } from '@huddle01/huddle01-client';
import PeerVideoAudioElem from './components/PeerVideoAudioElem';

function App() {
  const huddleClient = getHuddleClient('arcinston');
  const stream = useRootStore((state) => state.stream);
  const enableStream = useRootStore((state) => state.enableStream);
  const pauseTracks = useRootStore((state) => state.pauseTracks);
  const isCamPaused = useRootStore((state) => state.isCamPaused);
  const peers = useRootStore((state) => state.peers);
  const peerId = useRootStore((state) => state.peerId);
  const lobbyPeers = useRootStore((state) => state.lobbyPeers);
  const roomState = useRootStore((state) => state.roomState);
  const isHost = huddleClient.hostId === peerId;

  const [roomName, setRoomName] = useState('');
  const handleJoin = async (roomId: string) => {
    try {
      await huddleClient.join(roomId, {
        address: '0x15900c698ee356E6976e5645394F027F0704c8Eb',
        wallet: '',
        ens: 'axit.eth',
      });

      console.log('joined');
    } catch (error) {
      console.log({ error });
    }
  };

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    console.log({ peers: Object.values(peers), peerId, isCamPaused });
  }, [peers, peerId, isCamPaused]);

  return (
    <HuddleClientProvider value={huddleClient}>
      <h2 className={`text-${!roomState.joined ? 'red' : 'green'}`}>
        Room Joined:&nbsp;{roomState.joined ? roomState.roomId : 'Not Joined'}
      </h2>
      {!roomState.joined && (
        <div className="grid grid-cols-2 ">
          <input
            type="text"
            value={roomName}
            className="min-padding"
            placeholder="Enter Room Name"
            onChange={(e) => setRoomName(e.target.value)}
            onKeyDown={(e) => {
              if (!roomName) return;
              if (e.key === 'Enter') setRoomName(e.target.value);
            }}
          />
          <button onClick={() => handleJoin(roomName)}>Join Room</button>
        </div>
      )}

      <div>
        {!isCamPaused && <video style={{ width: '50%' }} ref={videoRef} autoPlay muted></video>}

        {lobbyPeers[0] && <h2>Lobby Peers</h2>}
        <div>
          {lobbyPeers.map((peer) => (
            <div>{peer.peerId}</div>
          ))}
        </div>

        {Object.values(peers)[0] && <h2>Peers</h2>}

        <div className="peers-grid">
          {Object.values(peers).map((peer) => (
            <PeerVideoAudioElem peerIdAtIndex={peer.peerId} />
          ))}
        </div>
      </div>
      <div className="btm-bar">
        <button onClick={() => enableStream()}>Enable Stream</button>
        <button onClick={() => pauseTracks()}>Disable Stream</button>
        <button onClick={() => huddleClient.enableWebcam()}>Enable Webcam</button>
        <button onClick={() => huddleClient.disableWebcam()}>Disable Webcam</button>
        {lobbyPeers[0] && isHost && (
          <button onClick={() => huddleClient.allowAllLobbyPeersToJoinRoom()}>Allow Lobby Peers</button>
        )}
        {isHost && (
          <button onClick={() => huddleClient.toggleRoomLock()}>
            {roomState.isRoomLocked ? 'Unlock ' : 'Lock '} Room
          </button>
        )}
      </div>
    </HuddleClientProvider>
  );
}

export default App;
