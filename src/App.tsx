import React, { useEffect, useState } from 'react';
import { Box, VStack, useToast } from '@chakra-ui/react';
import zoomSdk from '@zoom/appssdk';
import { io, Socket } from 'socket.io-client';
import Header from './components/Header';
import TicketForm from './components/TicketForm';
import PointingSession from './components/PointingSession';
import Results from './components/Results';
import { Ticket, Vote, ZoomParticipant, ZoomUserContext } from './types';

const App: React.FC = () => {
  const [zoomInitialized, setZoomInitialized] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [meetingId, setMeetingId] = useState<string>('');
  const [participants, setParticipants] = useState<ZoomParticipant[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [socketUrl, setSocketUrl] = useState<string>('http://localhost:3001');
  const toast = useToast();

  // Fetch server configuration
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const config = await response.json();
        console.log('Received config:', config);
        setSocketUrl(config.socketUrl);
      } catch (error) {
        console.error('Error fetching server config:', error);
        toast({
          title: 'Error connecting to server',
          description: 'Using default configuration',
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
      }
    };
    fetchConfig();
  }, [toast]);

  // Initialize Zoom SDK and socket connection
  useEffect(() => {
    const initializeZoomSdk = async () => {
      console.log('Initializing Zoom SDK');
      try {
        // Configure Zoom SDK with required capabilities
        const configResponse = await zoomSdk.config({
          capabilities: [
            'getSupportedJsApis',
            'getMeetingContext',
            'getUserContext',
            'getMeetingParticipants',
            'sendAppInvitation',
            'showNotification',
            'onParticipantChange'
          ],
          version: '0.16'
        });

        console.log('Zoom SDK initialized', configResponse);
        setZoomInitialized(true);

        // Get meeting context for meeting ID
        const meetingContext = await zoomSdk.getMeetingContext();
        console.log('Meeting context', meetingContext);
        setMeetingId(meetingContext.meetingID);

        // Get user info
        const userContextResponse = await zoomSdk.getUserContext();
        const userContext = userContextResponse as unknown as ZoomUserContext;
        setUserId(userContext.participantId);
        setIsHost(userContext.role === 'host' || userContext.role === 'cohost');

        // Initialize socket connection with the fetched URL
        console.log('Connecting to socket at:', socketUrl);
        const newSocket = io(socketUrl, {
          query: {
            meetingId: meetingContext.meetingID,
            userId: userContext.participantId
          }
        });

        newSocket.on('connect', () => {
          console.log('Connected to WebSocket server');
        });

        newSocket.on('stateUpdate', (data: { 
          ticket: Ticket | null;
          votes: Vote[];
          participants: ZoomParticipant[];
        }) => {
          setCurrentTicket(data.ticket);
          setVotes(data.votes);
          setParticipants(data.participants);
        });

        newSocket.on('meetingEnded', () => {
          setCurrentTicket(null);
          setVotes([]);
          setShowResults(false);
          toast({
            title: 'Meeting ended',
            description: 'The pointing session has ended.',
            status: 'info',
            duration: 5000,
            isClosable: true,
          });
        });

        setSocket(newSocket);

        // Get meeting participants
        const participantsResponse = await zoomSdk.getMeetingParticipants();
        if (participantsResponse && participantsResponse.participants) {
          const participants = participantsResponse.participants.map((p) => {
            const newParticipant = {
                userId: p.participantUUID, 
                displayName: p.screenName,
                isHost: p.role === 'host',
                isCoHost: p.role === 'cohost'
            };
            return newParticipant;
        });
        setParticipants(participants);
        }

        // Register event listener for participant changes
        zoomSdk.onParticipantChange((event) => {
          if (event && event.participants) {
            const participants = event.participants.map((p) => {
              const newParticipant = {
                userId: p.participantUUID,
                displayName: p.screenName,
                isHost: p.role === 'host',
                isCoHost: p.role === 'cohost'
            };
            return newParticipant;
          });
          setParticipants(participants);
          }
        });
      } catch (error) {
        console.error('Error initializing Zoom SDK:', error);
        toast({
          title: 'Error initializing Zoom app',
          description: 'Please try refreshing the page.',
          status: 'error',
          duration: 9000,
          isClosable: true,
        });
      }
    };

    if (socketUrl) {  // Only initialize when we have a socket URL
      initializeZoomSdk();
    }

    // Cleanup function
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socketUrl, toast]); // Add socketUrl as a dependency

  const handleCreateTicket = (ticket: Ticket) => {
    if (socket) {
      socket.emit('createTicket', ticket);
    }
    
    toast({
      title: 'New ticket created',
      description: `Ticket "${ticket.title}" is now open for pointing.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleSubmitVote = (points: number) => {
    if (!userId || !currentTicket || !socket) return;
    
    const vote: Vote = { userId, points, displayName: participants.find(p => p.userId === userId)?.displayName || '' };
    socket.emit('submitVote', vote);
    
    toast({
      title: 'Vote submitted',
      description: `You voted: ${points} points`,
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleRevealResults = () => {
    setShowResults(true);
    
    toast({
      title: 'Results revealed',
      description: 'All votes are now visible to everyone.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleEndSession = () => {
    if (socket) {
      socket.emit('endMeeting');
    }
  };

  return (
    <Box p={4} maxW="800px" mx="auto">
      <VStack spacing={6} align="stretch">
        <Header isHost={isHost} />
        
        {!zoomInitialized ? (
          <Box p={4} textAlign="center">
            Initializing Zoom app...
          </Box>
        ) : !currentTicket ? (
          <TicketForm onSubmit={handleCreateTicket} />
        ) : !showResults ? (
          <PointingSession 
            ticket={currentTicket}
            votes={votes}
            participants={participants}
            isHost={isHost}
            onSubmitVote={handleSubmitVote}
            onRevealResults={handleRevealResults}
          />
        ) : (
          <Results 
            ticket={currentTicket}
            votes={votes}
            isHost={isHost}
            onEndSession={handleEndSession}
          />
        )}
      </VStack>
    </Box>
  );
};

export default App; 