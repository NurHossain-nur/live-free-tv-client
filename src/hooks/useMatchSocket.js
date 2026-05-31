import { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/SocketContext';

export const useMatchSocket = (matchId, initialMatchData = null) => {
  const { socket, isConnected } = useContext(SocketContext);
  const [liveData, setLiveData] = useState(initialMatchData);

  useEffect(() => {
    // Sync local state if initial data changes (e.g., from an API fetch)
    if (initialMatchData) {
      setLiveData(initialMatchData);
    }
  }, [initialMatchData]);

  useEffect(() => {
    if (!socket || !isConnected || !matchId) return;

    // Join the specific room for this match
    socket.emit('joinMatchRoom', matchId);

    // Listen for live score/event updates from the server
    const handleScoreUpdate = (updatedData) => {
      setLiveData((prevData) => ({
        ...prevData,
        ...updatedData,
      }));
    };

    socket.on('matchUpdate', handleScoreUpdate);

    // Cleanup function: Leave the room when component unmounts
    return () => {
      socket.off('matchUpdate', handleScoreUpdate);
      socket.emit('leaveMatchRoom', matchId);
    };
  }, [socket, isConnected, matchId]);

  return liveData;
};