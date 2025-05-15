import React from 'react';
import { Flex, Heading, Text, useColorMode, IconButton } from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

interface HeaderProps {
  isHost: boolean;
}

const Header: React.FC<HeaderProps> = ({ isHost }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Flex justify="space-between" align="center" mb={4}>
      <Flex direction="column">
        <Heading size="lg" color="brand.600">Zoom Pointing Poker</Heading>
        <Text fontSize="sm" color="gray.500">
          {isHost ? 'Meeting Host' : 'Participant'}
        </Text>
      </Flex>
      <IconButton
        aria-label="Toggle color mode"
        icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
        onClick={toggleColorMode}
        variant="ghost"
      />
    </Flex>
  );
};

export default Header; 