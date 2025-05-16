import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Confetti from './Confetti';
import { Ticket, Vote } from '../types';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface ResultsProps {
  ticket: Ticket;
  votes: Vote[];
  isHost: boolean;
  onEndSession: () => void;
}

const Results: React.FC<ResultsProps> = ({
  ticket,
  votes,
  isHost,
  onEndSession,
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Check if all votes are the same
    const allVotesSame = votes.every(vote => vote.points === votes[0].points);
    if (allVotesSame && votes.length > 0) {
      console.log('Unanimous vote! Showing confetti');
      setShowConfetti(true);
      // Hide confetti after 5 seconds
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [votes]);

  // Calculate vote statistics
  const voteStats = useMemo(() => {
    const pointCounts: Record<number, number> = {};
    
    // Count votes for each point value
    votes.forEach(vote => {
      pointCounts[vote.points] = (pointCounts[vote.points] || 0) + 1;
    });
    
    // Calculate averages and most common vote
    const totalPoints = votes.reduce((sum, vote) => sum + vote.points, 0);
    const average = votes.length > 0 ? totalPoints / votes.length : 0;
    
    // Find the most common point value (mode)
    let mode = 0;
    let maxCount = 0;
    
    Object.entries(pointCounts).forEach(([points, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mode = parseInt(points, 10);
      }
    });
    
    return {
      counts: pointCounts,
      average: parseFloat(average.toFixed(1)),
      mode,
    };
  }, [votes]);
  
  // Prepare data for the pie chart
  const chartData = useMemo(() => {
    const labels = Object.keys(voteStats.counts).sort((a, b) => Number(a) - Number(b));
    const data = labels.map(label => voteStats.counts[Number(label)]);
    
    return {
      labels,
      datasets: [
        {
          label: 'Votes',
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)',
            'rgba(255, 159, 64, 0.7)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  }, [voteStats]);
  
  return (
    <Box>
      <Confetti active={showConfetti} duration={5000} />
      <VStack spacing={6} align="stretch">
        <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
          <VStack align="start" spacing={3}>
            <Heading size="md">{ticket.title}</Heading>
            {ticket.description && (
              <Text>{ticket.description}</Text>
            )}
            
            <HStack spacing={4} mt={2}>
              <Badge colorScheme="blue" p={2} fontSize="md">
                Average: {voteStats.average}
              </Badge>
              <Badge colorScheme="green" p={2} fontSize="md">
                Consensus: {voteStats.mode}
              </Badge>
            </HStack>
          </VStack>
        </Box>
        
        <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="md">
          <Heading size="md" mb={4}>Voting Results</Heading>
          
          <Flex direction={{ base: 'column', md: 'row' }} gap={6} align="center">
            <Box flex="1" maxW={{ base: '100%', md: '50%' }} mx="auto">
              <Pie data={chartData} options={{ maintainAspectRatio: false }} />
            </Box>
            
            <Box flex="1">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Participant</Th>
                    <Th isNumeric>Points</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {votes.map((vote, index) => (
                    <Tr key={vote.userId}>
                      <Td>{vote.displayName}</Td>
                      <Td isNumeric>{vote.points}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Flex>
        </Box>
        
        {isHost && (
          <Flex justify="flex-end">
            <Button
              colorScheme="blue"
              onClick={onEndSession}
            >
              New Ticket
            </Button>
          </Flex>
        )}
      </VStack>
    </Box>
  );
};

export default Results; 