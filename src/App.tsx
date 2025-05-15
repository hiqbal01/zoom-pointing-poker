import React, { useEffect, useState } from 'react';
import { Box, VStack, useToast } from '@chakra-ui/react';
import zoomSdk from '@zoom/appssdk';
import Header from './components/Header';
import TicketForm from './components/TicketForm';
import PointingSession from './components/PointingSession';
import Results from './components/Results';
import { Ticket, Vote, ZoomUserContext } from './types';

const App: React.FC = () => {
  const [zoomInitialized, setZoomInitialized] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [userId, setUserId] = useState<string>('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [showResults, setShowResults] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const initializeZoomSdk = async () => {
      console.log('Initializing Zoom SDK');
      try {
        // Configure Zoom SDK with required capabilities
        const configResponse = await zoomSdk.config({
          capabilities: [
            // Using proper API names according to documentation
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

        // Get user info
        const userContextResponse = await zoomSdk.getUserContext();
        // Cast to our custom interface that matches the actual structure
        const userContext = userContextResponse as unknown as ZoomUserContext;
        setUserId(userContext.userId);
        setIsHost(userContext.isHost || userContext.isCoHost);

        // Get meeting participants
        const participantsResponse = await zoomSdk.getMeetingParticipants();
        if (participantsResponse && participantsResponse.participants) {
          const participantIds = participantsResponse.participants.map(
            (participant) => participant.participantUUID
          );
          setParticipants(participantIds);
        }

        // Register event listener for participant changes
        zoomSdk.onParticipantChange((event) => {
          if (event && event.participants) {
            const participantIds = event.participants.map(
              (participant) => participant.participantUUID
            );
            setParticipants(participantIds);
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

    initializeZoomSdk();

    // Cleanup function
    return () => {
      // Remove event listeners if needed
    };
  }, [toast]);

  const handleCreateTicket = (ticket: Ticket) => {
    setCurrentTicket(ticket);
    setVotes([]);
    setShowResults(false);
    
    toast({
      title: 'New ticket created',
      description: `Ticket "${ticket.title}" is now open for pointing.`,
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
  };

  const handleSubmitVote = (points: number) => {
    if (!userId || !currentTicket) return;
    
    // Check if the user has already voted
    const existingVoteIndex = votes.findIndex(vote => vote.userId === userId);
    
    if (existingVoteIndex >= 0) {
      // Update existing vote
      const updatedVotes = [...votes];
      updatedVotes[existingVoteIndex] = { userId, points };
      setVotes(updatedVotes);
    } else {
      // Add new vote
      setVotes([...votes, { userId, points }]);
    }
    
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
    setCurrentTicket(null);
    setVotes([]);
    setShowResults(false);
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