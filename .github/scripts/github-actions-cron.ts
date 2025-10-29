// GitHub Actions Cron Runner - HTTP Gateway Caller
// Calls Railway gateway instead of direct database connection

// ✅ ENVIRONMENT VARIABLES
const RAILWAY_GATEWAY_URL = process.env.RAILWAY_GATEWAY_URL || '';
const CRON_SUPABASE_DB_URL = process.env.CRON_SUPABASE_DB_URL || '';
const CRON_RUNNER_PASSWORD = process.env.CRON_RUNNER_PASSWORD || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// ✅ RUNNER IDENTITY
const RUNNER_NAME = 'GitHub - Workflow';
const SERVICE_TYPE = 'GitHub - Workflow';

// ✅ VALIDATE CREDENTIALS
if (!RAILWAY_GATEWAY_URL || !CRON_SUPABASE_DB_URL || !CRON_RUNNER_PASSWORD || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:');
  console.error('  RAILWAY_GATEWAY_URL:', RAILWAY_GATEWAY_URL ? 'SET' : 'MISSING');
  console.error('  CRON_SUPABASE_DB_URL:', CRON_SUPABASE_DB_URL ? 'SET' : 'MISSING');
  console.error('  CRON_RUNNER_PASSWORD:', CRON_RUNNER_PASSWORD ? 'SET' : 'MISSING');
  console.error('  SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
  process.exit(1);
}

console.log(`[${new Date().toISOString()}] GitHub Actions Cron Runner initialized`);
console.log(`Gateway URL: ${RAILWAY_GATEWAY_URL}`);
console.log(`Service Type: ${SERVICE_TYPE}`);

// ✅ SAFE ERROR EXTRACTOR
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Unknown error occurred';
};

// ✅ MAIN EXECUTION - CALL GATEWAY VIA HTTP
async function main(): Promise<void> {
  const startTime = new Date();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`GitHub Actions Cron Job Started: ${startTime.toISOString()}`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // ✅ PREPARE REQUEST PAYLOAD
    const requestPayload = {
      runner_name: RUNNER_NAME,
      service_type: SERVICE_TYPE,
      db_url: CRON_SUPABASE_DB_URL,
      service_role_key: SUPABASE_SERVICE_ROLE_KEY
    };

    console.log('Calling Railway Gateway...');
    console.log(`URL: ${RAILWAY_GATEWAY_URL}`);
    console.log(`Runner: ${RUNNER_NAME}`);
    console.log(`Service Type: ${SERVICE_TYPE}`);

    // ✅ CALL GATEWAY
    const response = await fetch(RAILWAY_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Cron-Password': CRON_RUNNER_PASSWORD
      },
      body: JSON.stringify(requestPayload)
    });

    // ✅ PARSE RESPONSE
    const responseData = await response.json();

    // ✅ CHECK STATUS
    if (!response.ok) {
      console.error(`❌ Gateway returned error status: ${response.status}`);
      console.error('Error response:', JSON.stringify(responseData, null, 2));
      process.exit(1);
    }

    // ✅ LOG RESULTS
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`GitHub Actions Cron Job Completed`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Gateway Response:`, JSON.stringify(responseData, null, 2));
    
    if (responseData.success) {
      console.log(`\n✅ SUCCESS`);
      console.log(`Total Claimed: ${responseData.total_claimed || 0}`);
      console.log(`Succeeded: ${responseData.succeeded || 0}`);
      console.log(`Failed: ${responseData.failed || 0}`);
      
      if (responseData.errors && responseData.errors.length > 0) {
        console.log(`\nErrors:`);
        responseData.errors.forEach((err: string) => console.log(`  - ${err}`));
      }
    } else {
      console.error(`\n❌ FAILED`);
      console.error(`Error: ${responseData.error || 'Unknown error'}`);
      process.exit(1);
    }
    
    console.log(`${'='.repeat(60)}\n`);

    // ✅ EXIT WITH APPROPRIATE CODE
    const exitCode = (responseData.failed && responseData.failed > 0) ? 1 : 0;
    console.log(`Exiting with code: ${exitCode}`);
    process.exit(exitCode);

  } catch (error) {
    console.error('❌ Fatal error calling gateway:', getErrorMessage(error));
    console.error('Error details:', error);
    process.exit(1);
  }
}

// ✅ EXECUTE
main()
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
