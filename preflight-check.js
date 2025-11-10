#!/usr/bin/env node

/**
 * Pre-flight Check Script
 * Verifies all prerequisites before starting the integration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkExists(filePath) {
  return fs.existsSync(filePath);
}

function checkNodeVersion() {
  log('\n🔍 Checking Node.js version...', 'cyan');
  try {
    const version = process.version;
    const major = parseInt(version.split('.')[0].substring(1));
    
    if (major >= 18) {
      log(`✅ Node.js version: ${version} (required: >= 18)`, 'green');
      return true;
    } else {
      log(`❌ Node.js version: ${version} (required: >= 18)`, 'red');
      log('   Please upgrade Node.js', 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ Could not check Node.js version: ${error.message}`, 'red');
    return false;
  }
}

function checkNpmInstalled() {
  log('\n🔍 Checking npm...', 'cyan');
  try {
    const version = execSync('npm --version', { encoding: 'utf8' }).trim();
    log(`✅ npm version: ${version}`, 'green');
    return true;
  } catch (error) {
    log('❌ npm is not installed', 'red');
    return false;
  }
}

function checkDirectoryStructure() {
  log('\n🔍 Checking directory structure...', 'cyan');
  
  const requiredPaths = [
    'travel-ecosystem-backend/micro-services/discovery-engine',
    'travel-ecosystem/apps/trip-planner',
  ];

  let allExist = true;
  requiredPaths.forEach(p => {
    if (checkExists(p)) {
      log(`✅ ${p}`, 'green');
    } else {
      log(`❌ ${p} not found`, 'red');
      allExist = false;
    }
  });

  return allExist;
}

function checkPackageJson() {
  log('\n🔍 Checking package.json files...', 'cyan');
  
  const packageFiles = [
    'travel-ecosystem-backend/micro-services/discovery-engine/package.json',
    'travel-ecosystem/apps/trip-planner/package.json',
  ];

  let allExist = true;
  packageFiles.forEach(p => {
    if (checkExists(p)) {
      log(`✅ ${p}`, 'green');
    } else {
      log(`❌ ${p} not found`, 'red');
      allExist = false;
    }
  });

  return allExist;
}

function checkEnvFiles() {
  log('\n🔍 Checking environment files...', 'cyan');
  
  const envFiles = [
    {
      path: 'travel-ecosystem-backend/micro-services/discovery-engine/.env',
      required: ['GOOGLE_PLACE_API'],
    },
    {
      path: 'travel-ecosystem/apps/trip-planner/.env',
      required: ['VITE_DISCOVERY_API_URL'],
    },
  ];

  let allValid = true;
  envFiles.forEach(({ path: envPath, required }) => {
    if (checkExists(envPath)) {
      log(`✅ ${envPath} exists`, 'green');
      
      // Check required variables
      const content = fs.readFileSync(envPath, 'utf8');
      required.forEach(variable => {
        if (content.includes(variable)) {
          log(`   ✓ ${variable} configured`, 'blue');
        } else {
          log(`   ⚠️  ${variable} not found`, 'yellow');
        }
      });
    } else {
      log(`❌ ${envPath} not found`, 'red');
      allValid = false;
    }
  });

  return allValid;
}

function checkNodeModules() {
  log('\n🔍 Checking node_modules...', 'cyan');
  
  const nodeModulesPaths = [
    'travel-ecosystem-backend/micro-services/discovery-engine/node_modules',
    'travel-ecosystem/apps/trip-planner/node_modules',
  ];

  let allExist = true;
  nodeModulesPaths.forEach(p => {
    if (checkExists(p)) {
      log(`✅ ${p}`, 'green');
    } else {
      log(`⚠️  ${p} not found (need to run npm install)`, 'yellow');
      allExist = false;
    }
  });

  if (!allExist) {
    log('\n💡 Run npm install in both directories:', 'blue');
    log('   cd travel-ecosystem-backend/micro-services/discovery-engine && npm install', 'blue');
    log('   cd travel-ecosystem/apps/trip-planner && npm install', 'blue');
  }

  return allExist;
}

function checkPortsAvailable() {
  log('\n🔍 Checking if required ports are available...', 'cyan');
  
  const net = require('net');
  const ports = [3000, 1005];
  
  return Promise.all(ports.map(port => {
    return new Promise((resolve) => {
      const server = net.createServer();
      
      server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          log(`⚠️  Port ${port} is in use`, 'yellow');
          resolve(false);
        } else {
          resolve(true);
        }
      });
      
      server.once('listening', () => {
        server.close();
        log(`✅ Port ${port} is available`, 'green');
        resolve(true);
      });
      
      server.listen(port);
    });
  })).then(results => results.every(Boolean));
}

async function runChecks() {
  log('╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║        Pre-flight Check for Integration               ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');

  const results = {
    nodeVersion: false,
    npm: false,
    directoryStructure: false,
    packageJson: false,
    envFiles: false,
    nodeModules: false,
    ports: false,
  };

  // Run synchronous checks
  results.nodeVersion = checkNodeVersion();
  results.npm = checkNpmInstalled();
  results.directoryStructure = checkDirectoryStructure();
  results.packageJson = checkPackageJson();
  results.envFiles = checkEnvFiles();
  results.nodeModules = checkNodeModules();
  
  // Run async checks
  results.ports = await checkPortsAvailable();

  // Summary
  log('\n╔════════════════════════════════════════════════════════╗', 'cyan');
  log('║                  Check Summary                        ║', 'cyan');
  log('╚════════════════════════════════════════════════════════╝', 'cyan');
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([check, result]) => {
    const icon = result ? '✅' : '❌';
    const color = result ? 'green' : 'red';
    const label = check
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
    log(`${icon} ${label.padEnd(30)} ${result ? 'PASSED' : 'FAILED'}`, color);
  });

  log(`\n${passed}/${total} checks passed`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    log('\n🎉 All checks passed! You are ready to start the integration.', 'green');
    log('\nNext steps:', 'cyan');
    log('1. Run: start-integration.bat (or manually start both services)', 'blue');
    log('2. Wait for services to start (10-30 seconds)', 'blue');
    log('3. Run: node test-integration.js (to verify connection)', 'blue');
    log('4. Open browser: http://localhost:1005', 'blue');
  } else {
    log('\n⚠️  Some checks failed. Please fix the issues above.', 'yellow');
    
    if (!results.nodeModules) {
      log('\n📦 Install dependencies:', 'cyan');
      log('cd travel-ecosystem-backend/micro-services/discovery-engine && npm install', 'blue');
      log('cd travel-ecosystem/apps/trip-planner && npm install', 'blue');
    }
    
    if (!results.envFiles) {
      log('\n🔧 Configure environment variables:', 'cyan');
      log('Check .env files in both projects', 'blue');
      log('Make sure GOOGLE_PLACE_API and VITE_DISCOVERY_API_URL are set', 'blue');
    }
    
    if (!results.ports) {
      log('\n🔌 Free up required ports:', 'cyan');
      log('Stop any services running on ports 3000 and 1005', 'blue');
    }
  }

  process.exit(passed === total ? 0 : 1);
}

// Run the checks
runChecks().catch((error) => {
  log(`\n❌ Check script failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
