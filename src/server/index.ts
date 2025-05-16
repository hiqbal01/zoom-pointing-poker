import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Vote, Ticket } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Basic middleware
app.use(cors());
app.use(express.json());

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'"
  );
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

// In-memory storage
interface MeetingData {
  ticket: Ticket | null;
  votes: Vote[];
  participants: string[];
}

const meetings = new Map<string, MeetingData>();

// Helper to get or create meeting data
const getMeetingData = (meetingId: string): MeetingData => {
  if (!meetings.has(meetingId)) {
    meetings.set(meetingId, {
      ticket: null,
      votes: [],
      participants: []
    });
  }
  return meetings.get(meetingId)!;
};

// Socket.IO connection handling
io.on('connection', (socket) => {
  const meetingId = socket.handshake.query.meetingId as string;
  const userId = socket.handshake.query.userId as string;
  
  if (!meetingId || !userId) {
    socket.disconnect();
    return;
  }

  console.log(`User ${userId} connected to meeting ${meetingId}`);
  
  // Add participant to meeting
  const meetingData = getMeetingData(meetingId);
  if (!meetingData.participants.includes(userId)) {
    meetingData.participants.push(userId);
  }
  
  // Send current state to the new participant
  socket.emit('stateUpdate', {
    ticket: meetingData.ticket,
    votes: meetingData.votes,
    participants: meetingData.participants
  });

  // Handle new ticket creation
  socket.on('createTicket', (ticket: Ticket) => {
    const meetingData = getMeetingData(meetingId);
    meetingData.ticket = ticket;
    meetingData.votes = []; // Clear previous votes
    io.to(meetingId).emit('stateUpdate', {
      ticket: meetingData.ticket,
      votes: meetingData.votes,
      participants: meetingData.participants
    });
  });

  // Handle vote submission
  socket.on('submitVote', (vote: Vote) => {
    const meetingData = getMeetingData(meetingId);
    const existingVoteIndex = meetingData.votes.findIndex(v => v.userId === vote.userId);
    
    if (existingVoteIndex >= 0) {
      meetingData.votes[existingVoteIndex] = vote;
    } else {
      meetingData.votes.push(vote);
    }
    
    io.to(meetingId).emit('stateUpdate', {
      ticket: meetingData.ticket,
      votes: meetingData.votes,
      participants: meetingData.participants
    });
  });

  // Handle meeting end
  socket.on('endMeeting', () => {
    meetings.delete(meetingId);
    io.to(meetingId).emit('meetingEnded');
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const meetingData = getMeetingData(meetingId);
    meetingData.participants = meetingData.participants.filter(id => id !== userId);
    
    // If no participants left, clean up meeting data
    if (meetingData.participants.length === 0) {
      meetings.delete(meetingId);
    } else {
      io.to(meetingId).emit('stateUpdate', {
        ticket: meetingData.ticket,
        votes: meetingData.votes,
        participants: meetingData.participants
      });
    }
  });

  // Join meeting room
  socket.join(meetingId);
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../../build');
  app.use(express.static(buildPath, {
    setHeaders: (res, filePath) => {    
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader(
          'Content-Security-Policy',
          "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'"
          );
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Strict-Transport-Security', 'DENY');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }
  }));

  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 