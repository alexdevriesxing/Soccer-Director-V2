#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

// Configuration
const DATA_DIR = path.join(__dirname, '../data');
const SOURCES = {
  netherlands: {
    baseUrl: 'https://raw.githubusercontent.com/footballcsv/netherlands/master',
    files: [
      '2023-24/nl.1.csv', // Eredivisie
      '2023-24/nl.2.csv', // Eerste Divisie
      '2022-23/nl.1.csv',
      '2022-23/nl.2.csv',
      'clubs.csv'
    ]
  },
  england: {
    baseUrl: 'https://raw.githubusercontent.com/footballcsv/england/master',
    files: [
      '2023-24/eng.1.csv', // Premier League
      '2023-24/eng.2.csv', // Championship
      '2022-23/eng.1.csv',
      '2022-23/eng.2.csv'
    ]
  },
  germany: {
    baseUrl: 'https://raw.githubusercontent.com/footballcsv/deutschland/master',
    files: [
      '2023-24/de.1.csv', // Bundesliga
      '2023-24/de.2.csv', // 2. Bundesliga
      '2022-23/de.1.csv',
      '2022-23/de.2.csv'
    ]
  }
};

// Utility functions
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading: ${url}`);
    
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(filepath);
        console.log(`✅ Downloaded: ${path.basename(filepath)} (${(stats.size / 1024).toFixed(1)} KB)`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete file on error
      reject(err);
    });
  });
}

async function downloadSource(sourceName, source) {
  console.log(`\n🌍 Downloading ${sourceName.toUpperCase()} data...`);
  
  const sourceDir = path.join(DATA_DIR, sourceName);
  ensureDir(sourceDir);
  
  const results = {
    success: 0,
    failed: 0,
    errors: []
  };
  
  for (const file of source.files) {
    const url = `${source.baseUrl}/${file}`;
    const filepath = path.join(sourceDir, file);
    
    // Ensure subdirectories exist
    const fileDir = path.dirname(filepath);
    ensureDir(fileDir);
    
    try {
      await downloadFile(url, filepath);
      results.success++;
    } catch (error) {
      console.log(`❌ Failed to download ${file}: ${error.message}`);
      results.failed++;
      results.errors.push({ file, error: error.message });
    }
  }
  
  return results;
}

async function downloadAllSources() {
  console.log('🚀 Starting football data download...\n');
  
  ensureDir(DATA_DIR);
  
  const summary = {
    totalSuccess: 0,
    totalFailed: 0,
    sources: {}
  };
  
  for (const [sourceName, source] of Object.entries(SOURCES)) {
    try {
      const results = await downloadSource(sourceName, source);
      summary.sources[sourceName] = results;
      summary.totalSuccess += results.success;
      summary.totalFailed += results.failed;
    } catch (error) {
      console.error(`❌ Failed to download ${sourceName}:`, error.message);
    }
  }
  
  // Print summary
  console.log('\n📊 Download Summary:');
  console.log('====================');
  
  for (const [sourceName, results] of Object.entries(summary.sources)) {
    console.log(`${sourceName.toUpperCase()}:`);
    console.log(`  ✅ Success: ${results.success} files`);
    console.log(`  ❌ Failed: ${results.failed} files`);
    
    if (results.errors.length > 0) {
      console.log('  Errors:');
      results.errors.forEach(({ file, error }) => {
        console.log(`    - ${file}: ${error}`);
      });
    }
  }
  
  console.log(`\n📈 Total: ${summary.totalSuccess} successful, ${summary.totalFailed} failed`);
  
  if (summary.totalSuccess > 0) {
    console.log('\n💡 Next steps:');
    console.log('1. Run the import script: npx ts-node prisma/seed/importRealData.ts');
    console.log('2. Check the downloaded files in the data/ directory');
    console.log('3. Customize the import logic for your needs');
  }
}

// Alternative: Clone repositories (more reliable)
function cloneRepositories() {
  console.log('🔧 Cloning football.csv repositories...\n');
  
  const repos = [
    'https://github.com/footballcsv/netherlands.git',
    'https://github.com/footballcsv/england.git',
    'https://github.com/footballcsv/deutschland.git'
  ];
  
  for (const repo of repos) {
    const repoName = repo.split('/').pop().replace('.git', '');
    const repoDir = path.join(DATA_DIR, repoName);
    
    if (fs.existsSync(repoDir)) {
      console.log(`📁 Repository ${repoName} already exists, skipping...`);
      continue;
    }
    
    try {
      console.log(`📥 Cloning ${repoName}...`);
      execSync(`git clone ${repo} ${repoDir}`, { stdio: 'inherit' });
      console.log(`✅ Cloned ${repoName}`);
    } catch (error) {
      console.error(`❌ Failed to clone ${repoName}:`, error.message);
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--clone') || args.includes('-c')) {
    cloneRepositories();
  } else {
    await downloadAllSources();
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main().catch(console.error); 