#!/usr/bin/env node

/**
 * This script helps developers set up their Zoom App
 * Run this with: node scripts/setupZoomApp.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n=== Zoom Pointing Poker App Setup ===\n');
console.log('This script will help you set up your Zoom App configuration.\n');
console.log('To use this app with Zoom, you need to create a Zoom App in the Zoom Marketplace:\n');
console.log('1. Go to https://marketplace.zoom.us/');
console.log('2. Click "Develop" > "Build App"');
console.log('3. Choose "In-Client App"');
console.log('4. Fill in the required information');
console.log('5. Under App Features, enable "Zoom App"');
console.log('6. Configure your app with the following features:');
console.log('   - User Identity');
console.log('   - In-Meeting UI');
console.log('   - Meeting Events');
console.log('   - Participant Chat');
console.log('\nOnce you have created your app, you need to provide the following information:\n');

const envFile = path.join(__dirname, '..', '.env');
const envContent = [];

rl.question('Client ID: ', (clientId) => {
  envContent.push(`REACT_APP_ZOOM_CLIENT_ID=${clientId}`);
  
  rl.question('Client Secret: ', (clientSecret) => {
    envContent.push(`REACT_APP_ZOOM_CLIENT_SECRET=${clientSecret}`);
    
    rl.question('Redirect URL (e.g., http://localhost:3000): ', (redirectUrl) => {
      envContent.push(`REACT_APP_ZOOM_REDIRECT_URL=${redirectUrl}`);
      
      fs.writeFileSync(envFile, envContent.join('\n'));
      console.log(`\nConfiguration saved to ${envFile}`);
      console.log('\nYou can now start the app with:');
      console.log('  npm start');
      console.log('\nRemember to add the following URL to your Zoom App configuration:');
      console.log(`  Redirect URL: ${redirectUrl}`);
      console.log('  Home URL: http://localhost:3000');
      console.log('\nHappy coding!\n');
      
      rl.close();
    });
  });
}); 