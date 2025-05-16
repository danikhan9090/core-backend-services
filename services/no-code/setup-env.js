const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, '.env');

// Check if .env file exists
if (fs.existsSync(envPath)) {
  console.log('.env file already exists. Do you want to overwrite it? (y/n)');
  rl.question('', (answer) => {
    if (answer.toLowerCase() === 'y') {
      createEnvFile();
    } else {
      console.log('Setup cancelled.');
      rl.close();
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  console.log('\nSetting up environment variables...\n');

  const questions = [
    {
      name: 'MONGODB_URI',
      message: 'Enter your MongoDB Atlas connection string: ',
      required: true
    },
    {
      name: 'PORT',
      message: 'Enter the port number (default: 3000): ',
      default: '3000'
    },
    {
      name: 'NODE_ENV',
      message: 'Enter the environment (development/production): ',
      default: 'development'
    }
  ];

  let envContent = '';

  function askQuestion(index) {
    if (index === questions.length) {
      // Add other default values
      envContent += `
# Logging
LOG_LEVEL=info
LOG_FORMAT=dev

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true

# Security
HELMET_ENABLED=true
TRUST_PROXY=1
`;

      // Write to .env file
      fs.writeFileSync(envPath, envContent.trim());
      console.log('\n.env file has been created successfully!');
      rl.close();
      return;
    }

    const question = questions[index];
    rl.question(question.message, (answer) => {
      if (!answer && question.required) {
        console.log('This field is required!');
        askQuestion(index);
        return;
      }

      const value = answer || question.default;
      envContent += `${question.name}=${value}\n`;
      askQuestion(index + 1);
    });
  }

  askQuestion(0);
} 