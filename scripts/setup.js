/**
 * Setup script for Fidelyz SaaS
 * Run this script to initialize the application and verify configuration
 * 
 * Usage: node scripts/setup.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.blue}${colors.bright}[${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
}

function logError(message) {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
}

function checkEnvFile() {
  logStep(1, "Checking environment configuration...");
  
  const envPath = path.join(__dirname, "..", ".env");
  const envExamplePath = path.join(__dirname, "..", ".env.example");
  
  if (fs.existsSync(envPath)) {
    logSuccess(".env file exists");
    return true;
  }
  
  if (fs.existsSync(envExamplePath)) {
    logWarning(".env file not found, copying from .env.example");
    fs.copyFileSync(envExamplePath, envPath);
    logSuccess("Created .env from .env.example");
    logWarning("Please edit .env and add your API keys");
    return false;
  }
  
  logError(".env.example not found");
  return false;
}

function checkNodeVersion() {
  logStep(2, "Checking Node.js version...");
  
  const version = process.version.match(/^v(\d+)\./);
  const majorVersion = version ? parseInt(version[1]) : 0;
  
  if (majorVersion >= 18) {
    logSuccess(`Node.js ${process.version} - OK`);
    return true;
  }
  
  logError(`Node.js ${process.version} - Requires v18 or higher`);
  return false;
}

function installDependencies() {
  logStep(3, "Installing dependencies...");
  
  try {
    execSync("npm install", { stdio: "inherit" });
    logSuccess("Dependencies installed");
    return true;
  } catch (error) {
    logError("Failed to install dependencies");
    return false;
  }
}

function generatePrismaClient() {
  logStep(4, "Generating Prisma client...");
  
  try {
    execSync("npx prisma generate", { stdio: "inherit" });
    logSuccess("Prisma client generated");
    return true;
  } catch (error) {
    logError("Failed to generate Prisma client");
    return false;
  }
}

function checkDatabaseConnection() {
  logStep(5, "Checking database connection...");
  
  try {
    execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
    logSuccess("Database connection OK");
    return true;
  } catch (error) {
    logWarning("Database not available - will be configured later");
    return true; // Don't fail setup if DB is not available yet
  }
}

function verifyServices() {
  logStep(6, "Verifying service configuration...");
  
  const envPath = path.join(__dirname, "..", ".env");
  const envContent = fs.readFileSync(envPath, "utf8");
  
  const checks = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", name: "Supabase", required: true },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", name: "Supabase Key", required: true },
    { key: "DATABASE_URL", name: "Database", required: true },
    { key: "STRIPE_SECRET_KEY", name: "Stripe", required: false },
    { key: "RESEND_API_KEY", name: "Resend", required: false },
    { key: "TWILIO_ACCOUNT_SID", name: "Twilio", required: false },
    { key: "GOOGLE_AI_API_KEY", name: "Google AI", required: false },
    { key: "GOOGLE_WALLET_SERVICE_ACCOUNT_KEY", name: "Google Wallet", required: false },
  ];
  
  let allPassed = true;
  
  checks.forEach(({ key, name, required }) => {
    const regex = new RegExp(`^${key}=`, "m");
    const isSet = regex.test(envContent);
    
    if (isSet && !envContent.match(new RegExp(`^${key}=\\s*$`, "m"))) {
      logSuccess(`${name} configured`);
    } else if (required) {
      logWarning(`${name} not configured (required)`);
      allPassed = false;
    } else {
      logWarning(`${name} not configured (optional)`);
    }
  });
  
  return allPassed;
}

function printNextSteps() {
  console.log(`\n${colors.bright}=========================================${colors.reset}`);
  console.log(`${colors.bright}Setup Complete!${colors.reset}`);
  console.log(`${colors.bright}=========================================${colors.reset}\n`);
  
  console.log("Next steps:");
  console.log("1. Edit .env and add your API keys");
  console.log("2. Run: npm run dev");
  console.log("3. Open: http://localhost:3000");
  console.log("\nFor deployment, see DEPLOYMENT.md");
  console.log("\nUseful commands:");
  console.log("  npm run dev          - Start development server");
  console.log("  npm run build        - Build for production");
  console.log("  npm run db:studio    - Open Prisma Studio");
  console.log("  npm run lint         - Run linter");
  console.log("  npm test            - Run tests");
}

async function main() {
  console.log(`${colors.bright}Fidelyz SaaS Setup${colors.reset}\n`);
  
  const checks = [
    checkEnvFile(),
    checkNodeVersion(),
  ];
  
  if (checks.every(Boolean)) {
    await installDependencies();
    await generatePrismaClient();
    await checkDatabaseConnection();
    verifyServices();
  }
  
  printNextSteps();
}

main().catch(console.error);
