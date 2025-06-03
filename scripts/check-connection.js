const http = require('http');
const { exec } = require('child_process');

const BACKEND_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:19006';

function checkBackend() {
  return new Promise((resolve, reject) => {
    http.get(`${BACKEND_URL}/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('✅ Backend is running:', response);
          resolve(true);
        } catch (error) {
          console.error('❌ Backend response parsing failed:', error);
          reject(error);
        }
      });
    }).on('error', (error) => {
      console.error('❌ Backend connection failed:', error.message);
      reject(error);
    });
  });
}

function checkFrontend() {
  return new Promise((resolve, reject) => {
    http.get(FRONTEND_URL, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Frontend is running');
        resolve(true);
      } else {
        console.error('❌ Frontend returned status:', res.statusCode);
        reject(new Error(`Frontend returned status: ${res.statusCode}`));
      }
    }).on('error', (error) => {
      console.error('❌ Frontend connection failed:', error.message);
      reject(error);
    });
  });
}

function checkDatabase() {
  return new Promise((resolve, reject) => {
    // Add your database connection check here
    // This is a placeholder that assumes you're using PostgreSQL
    exec('pg_isready -h localhost -p 5432', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Database connection failed:', error.message);
        reject(error);
        return;
      }
      console.log('✅ Database is running');
      resolve(true);
    });
  });
}

async function checkAll() {
  try {
    console.log('🔍 Checking connections...\n');
    
    await checkBackend();
    await checkFrontend();
    await checkDatabase();
    
    console.log('\n✨ All systems are connected and running!');
  } catch (error) {
    console.error('\n❌ Connection check failed:', error.message);
    process.exit(1);
  }
}

checkAll(); 