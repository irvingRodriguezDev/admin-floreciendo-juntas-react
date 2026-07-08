import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const useLiveComments = (liveId) => {
  const [comments, setComments] = useState([]);
  const MAX_COMMENTS = 15;
  const socketRef = useRef(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!liveId) return;

    const socket = io(process.env.REACT_APP_BACKEND_URL_SOCKET, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      timeout: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join-live', liveId);
    });

    socket.on('load_comments', (data) => {
      setComments(data);
      // console.log("Comments loaded:", data);
    });

    socket.on('new_comment', (comment) => {
      setComments((prev) => {
        const updated = [...prev, comment];
        return updated.slice(-MAX_COMMENTS);
      });
    });

    // AQUÍ ESTABA EL ERROR
    socket.on('delete_comment', ({ liveId, message_id }) => {
      setComments((prev) =>
        prev.filter((comment) => comment.id !== message_id),
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [liveId]);

  const sendComment = (message) => {
    if (!message.trim() || !socketRef.current) return;

    socketRef.current.emit('send_comment', {
      liveId,
      message: message.trim(),
    });
  };

  // ELIMINAR MENSAJE
  const deleteComment = (messageId) => {
    socketRef.current?.emit('delete_comment', {
      message_id: messageId,
      liveId,
    });
    setComments((prev) => prev.filter((comment) => comment.id !== messageId));
  };

  return { comments, sendComment, deleteComment };
};

export default useLiveComments;
