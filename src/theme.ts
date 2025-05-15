import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const colors = {
  brand: {
    50: '#e5f3ff',
    100: '#b8dcff',
    200: '#8ac4ff',
    300: '#5cadff',
    400: '#2e96ff',
    500: '#147de6',
    600: '#0061b4',
    700: '#004582',
    800: '#002951',
    900: '#000e21',
  },
};

const theme = extendTheme({ config, colors });

export default theme; 