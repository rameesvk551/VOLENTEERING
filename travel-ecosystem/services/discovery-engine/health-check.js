#!/usr/bin/env node
// Health Check Script for Production Monitoring

const http = require('http');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const SERVICES = {
  api: {
    name: 'API Server',
    check: () => httpCheck('http://localhost:3000/api/v1/health'),
    critical: true
  },
  mongodb: {
    name: 'MongoDB',
    check: () => dockerCheck('discovery-mongodb', 'mongosh --eval "db.adminCommand(\'ping\')" --quiet'),
    critical: true
  },
  redis: {
    name: 'Redis',
    check: () => dockerCheck('discovery-redis', 'redis-cli ping'),
    critical: true
  },
  weaviate: {
    name: 'Weaviate',
    check: () => httpCheck('http://localhost:8080/v1/.well-known/ready'),
    critical: false
  }
};

// Colors
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function httpCheck(url, timeout = 5000) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: 'GET',
      timeout
    };

    const req = http.request(options, (res) => {
      const success = res.statusCode >= 200 && res.statusCode < 300;
      resolve({
        success,
        message: success ? 'OK' : `HTTP ${res.statusCode}`
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        message: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        message: 'Timeout'
      });
    });

    req.end();
  });
}

async function dockerCheck(container, command) {
  try {
    const { stdout, stderr } = await execPromise(
      `docker exec ${container} ${command}`,
      { timeout: 5000 }
    );

    if (stderr && !stdout) {
      return { success: false, message: stderr.trim() };
    }

    return {
      success: true,
      message: 'OK'
    };
  } catch (error) {
    return {
      success: false,
      message: error.message.includes('No such container')
        ? 'Container not running'
        : error.message
    };
  }
}

async function checkAll() {
  console.log(`\n${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║   Discovery Engine Health Check       ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════╝${colors.reset}\n`);

  const results = {};
  let allHealthy = true;
  let criticalFailed = false;

  for (const [key, service] of Object.entries(SERVICES)) {
    process.stdout.write(`${service.name}... `);

    const result = await service.check();
    results[key] = result;

    if (result.success) {
      console.log(`${colors.green}✓ ${result.message}${colors.reset}`);
    } else {
      const color = service.critical ? colors.red : colors.yellow;
      const icon = service.critical ? '✗' : '⚠';
      console.log(`${color}${icon} ${result.message}${colors.reset}`);
      allHealthy = false;

      if (service.critical) {
        criticalFailed = true;
      }
    }
  }

  console.log('\n' + '─'.repeat(42));

  if (allHealthy) {
    console.log(`${colors.green}✓ All services are healthy${colors.reset}`);
    return 0;
  } else if (criticalFailed) {
    console.log(`${colors.red}✗ Critical services are down${colors.reset}`);
    return 2;
  } else {
    console.log(`${colors.yellow}⚠ Some non-critical services are down${colors.reset}`);
    return 1;
  }
}

// Additional checks
async function detailedCheck() {
  console.log(`\n${colors.blue}Detailed System Information:${colors.reset}\n`);

  // Memory usage
  const used = process.memoryUsage();
  console.log('Memory Usage:');
  for (let key in used) {
    console.log(`  ${key}: ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }

  // Uptime
  console.log(`\nProcess Uptime: ${Math.floor(process.uptime())} seconds`);

  // Node version
  console.log(`Node Version: ${process.version}`);

  // Platform
  console.log(`Platform: ${process.platform}`);
  console.log(`Architecture: ${process.arch}`);

  console.log('');
}

// Main execution
(async () => {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');

  try {
    const exitCode = await checkAll();

    if (verbose) {
      await detailedCheck();
    }

    if (exitCode === 0) {
      console.log(`\n${colors.green}Health check passed!${colors.reset}\n`);
    } else if (exitCode === 1) {
      console.log(`\n${colors.yellow}Health check completed with warnings.${colors.reset}\n`);
    } else {
      console.log(`\n${colors.red}Health check failed!${colors.reset}\n`);
      console.log('Troubleshooting:');
      console.log('  1. Check if services are running: docker-compose ps');
      console.log('  2. View logs: docker-compose logs');
      console.log('  3. Restart services: docker-compose restart');
      console.log('  4. Check .env configuration\n');
    }

    process.exit(exitCode);
  } catch (error) {
    console.error(`\n${colors.red}Error during health check:${colors.reset}`, error.message);
    process.exit(3);
  }
})();
