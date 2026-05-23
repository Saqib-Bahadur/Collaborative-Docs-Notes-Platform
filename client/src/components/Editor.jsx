import Quill from 'quill';
import 'quill/dist/quill.snow.css';

import { Box } from '@mui/material';
import { useEffect, useState } from 'react';

import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

const SAVE_INTERVAL_MS = 2000;

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  ['link', 'image', 'video', 'formula'],

  [{ header: 1 }, { header: 2 }],
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ direction: 'rtl' }],

  [{ size: ['small', false, 'large', 'huge'] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],

  ['clean']
];

const Editor = () => {

  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);

  const { id } = useParams();

  // Initialize Quill Editor
  useEffect(() => {

    const container = document.getElementById('container');

    if (!container) return;

    container.innerHTML = '';

    const editor = document.createElement('div');

    container.append(editor);

    const q = new Quill(editor, {
      theme: 'snow',
      modules: {
        toolbar: toolbarOptions
      }
    });

    q.disable();

    setQuill(q);

  }, []);

  // Initialize Socket Connection
  useEffect(() => {

    const socketServer = io('http://localhost:9000');

    setSocket(socketServer);

    return () => {
      socketServer.disconnect();
    };

  }, []);

  // Load Document
  useEffect(() => {

    if (!socket || !quill) return;

    socket.once('load-document', document => {

      if (document) {
        quill.setContents(document);
      }

      quill.enable();

    });

    socket.emit('get-document', id);

  }, [socket, quill, id]);

  // Send Changes
  useEffect(() => {

    if (!socket || !quill) return;

    const handler = (delta, oldDelta, source) => {

      if (source !== 'user') return;

      socket.emit('send-changes', delta);

    };

    quill.on('text-change', handler);

    return () => {
      quill.off('text-change', handler);
    };

  }, [socket, quill]);

  // Receive Changes
  useEffect(() => {

    if (!socket || !quill) return;

    const handler = (delta) => {

      quill.updateContents(delta);

    };

    socket.on('receive-changes', handler);

    return () => {
      socket.off('receive-changes', handler);
    };

  }, [socket, quill]);

  // Auto Save Document
  useEffect(() => {

    if (!socket || !quill) return;

    const interval = setInterval(() => {

      socket.emit('save-document', quill.getContents());

    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };

  }, [socket, quill]);

  return (

    <Box className="app">

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <h1>Collaborative Document Editor</h1>
          <p>Create, edit & share documents with anyone in real-time.</p>
        </div>

        <div className="nav-tagline">
          Share, edit & save documents instantly online.
        </div>
      </nav>

      {/* Editor */}
      <Box className="Container" id="container"></Box>

      {/* Footer */}
      <footer className="footer">

        <div className="footer-content">

          <h3>Developed By Saqib</h3>

          <p>
            Full Stack MERN Developer | Real-Time Web Applications
          </p>

          <div className="footer-links">

            <a
              href="https://github.com/Saqib-Bahadur"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>

            <a
              href="mailto:saqibbahadur2361@gmail.com"
            >
              Email
            </a>

            <a
              href="https://www.linkedin.com/in/saqib-bahadur-6a779740b?utm_source=share_via&utm_content=profile&utm_medium=member_android"
            >
              LinkedIn
            </a>

          </div>

        </div>

      </footer>

    </Box>
  );
};

export default Editor;