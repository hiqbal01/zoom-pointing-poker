import React, { useState } from 'react';
import {
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  Text,
  Progress,
  Badge,
  VStack,
} from '@chakra-ui/react';
import { Ticket, Vote, PointValue, ZoomParticipant } from '../types';

interface PointingSessionProps {
  ticket: Ticket;
  votes: Vote[];
  participants: ZoomParticipant[];
  isHost: boolean;
  onSubmitVote: (points: number) => void;
  onRevealResults: () => void;
}

const POINT_VALUES: PointValue[] = [1, 2, 3, 5, 8, 13];

const PointingSession: React.FC<PointingSessionProps> = ({
  ticket,
  votes,
  participants,
  isHost,
  onSubmitVote,
  onRevealResults,
}) => {
  const [selectedPoints, setSelectedPoints] = useState<number | null>(null);
  
  const userVoted = (userId: string) => {
    return votes.some(vote => vote.userId === userId);
  };
  
  const hasVoted = (userId: string) => {
    return votes.some(vote => vote.userId === userId);
  };
  
  const votingProgress = participants.length > 0 
    ? (votes.length / participants.length) * 100 
    : 0;
    
  const allVoted = participants.length > 0 && votes.length === participants.length;
  
  return (
    <VStack spacing={6} align="stretch">
      <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
        <VStack align="start" spacing={3}>
          <Heading size="md">{ticket.title}</Heading>
          {ticket.description && (
            <Text>{ticket.description}</Text>
          )}
        </VStack>
      </Box>
      
      <Box>
        <Flex justify="space-between" mb={2}>
          <Text fontWeight="bold">Voting Progress</Text>
          <Text>{votes.length} of {participants.length} votes</Text>
        </Flex>
        <Progress 
          value={votingProgress} 
          colorScheme={allVoted ? "green" : "blue"} 
          borderRadius="md"
          size="md"
        />
      </Box>
      
      <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
        <VStack spacing={4} align="stretch">
          <Heading size="md">Select Points</Heading>
          
          <Grid templateColumns="repeat(3, 1fr)" gap={4}>
            {POINT_VALUES.map(points => (
              <Button
                key={points}
                size="lg"
                height="80px"
                colorScheme={selectedPoints === points ? "blue" : "gray"}
                variant={selectedPoints === points ? "solid" : "outline"}
                onClick={() => setSelectedPoints(points)}
              >
                {points}
              </Button>
            ))}
          </Grid>
          
          <Button
            colorScheme="green"
            isDisabled={selectedPoints === null}
            onClick={() => {
              if (selectedPoints !== null) {
                onSubmitVote(selectedPoints);
              }
            }}
          >
            Submit Vote
          </Button>
        </VStack>
      </Box>
      
      {isHost && (
        <Flex justify="flex-end">
          <Button
            colorScheme="blue"
            isDisabled={!allVoted}
            onClick={onRevealResults}
          >
            {allVoted 
              ? "Reveal Results" 
              : "Waiting for all votes..."}
          </Button>
        </Flex>
      )}
      
      {!isHost && allVoted && (
        <Flex justify="center">
          <Badge colorScheme="green" p={2} borderRadius="md">
            All votes submitted. Waiting for host to reveal results.
          </Badge>
        </Flex>
      )}
    </VStack>
  );
};

export default PointingSession; 