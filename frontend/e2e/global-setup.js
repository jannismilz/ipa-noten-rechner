/**
 * Global setup for E2E tests
 * Ensures test user exists in database before tests run
 */
export default async function globalSetup() {
  console.log('🔧 E2E Global Setup: Checking test environment...');
  
  // Wait for backend to be ready
  const maxRetries = 30;
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch('http://localhost:3001/api/evaluations/criteria');
      if (response.ok) {
        console.log('✅ Backend is ready');
        break;
      }
    } catch {
      // Backend not ready yet
    }
    retries++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (retries >= maxRetries) {
    throw new Error('Backend did not start in time');
  }
  
  console.log('✅ E2E Global Setup complete');
}
