// src/components/Notification.js
import React, { useEffect, useState } from "react";
import { WebSocketServer } from "ws";

const Notification = ({ prediction }) => {
  const [messages, setMessages] = useState([1, 0, 1, 0, 0, 0]);
  const [socket, setSocket] = useState(null);
  const current_stat = messages.slice(-1)[0];
  console.log(prediction);
  // useEffect(() => {
  //     // Connect to WebSocket server
  //     const ws = new WebSocketServer('http://localhost:8090');

  //     ws.onopen = () => {
  //         console.log('Connected to WebSocket server');
  //         ws.send(JSON.stringify({ type: 'subscribe', data: 'notifications' }));
  //     };

  //     ws.onmessage = (event) => {
  //         const message = event.data;
  //         console.log('Received message:', message);
  //         setMessages((prevMessages) => [...prevMessages, message]);
  //     };

  //     ws.onerror = (error) => {
  //         console.error('WebSocket error:', error);
  //     };

  //     ws.onclose = () => {
  //         console.log('WebSocket connection closed');
  //     };

  //     setSocket(ws);

  //     // Cleanup on component unmount
  //     return () => {
  //         ws.close();
  //     };
  // }, []);

  return (
    <>
      {prediction == 0 ? (
        <div className="`block px-3 py-2 rounded-md bg-green-200 border border-green-900 text-green-900 bg-center">
          <p>Status: Safe</p>
        </div>
      ) : (
        <div className="`block px-3 py-2 rounded-md bg-red-200 border border-red-900 text-red-900 bg-center">
          <p>Status: E-Coli Detected</p>
        </div>
      )}
    </>
  );
};

export default Notification;
