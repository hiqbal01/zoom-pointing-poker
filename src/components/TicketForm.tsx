import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  Heading,
} from '@chakra-ui/react';
import { v4 as uuidv4 } from 'uuid';
import { Ticket } from '../types';

interface TicketFormProps {
  onSubmit: (ticket: Ticket) => void;
}

const TicketForm: React.FC<TicketFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    const newTicket: Ticket = {
      id: uuidv4(),
      title: title.trim(),
      description: description.trim(),
    };
    
    onSubmit(newTicket);
    
    // Reset form
    setTitle('');
    setDescription('');
  };

  return (
    <Box
      as="form"
      onSubmit={handleSubmit}
      p={6}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
    >
      <VStack spacing={4} align="stretch">
        <Heading size="md">Create New Ticket</Heading>
        
        <FormControl isRequired>
          <FormLabel>Title</FormLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter ticket title or ID"
          />
        </FormControl>
        
        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter ticket description"
            rows={4}
          />
        </FormControl>
        
        <Button
          type="submit"
          colorScheme="blue"
          isDisabled={!title.trim()}
          alignSelf="flex-end"
        >
          Create Ticket
        </Button>
      </VStack>
    </Box>
  );
};

export default TicketForm; 