const cp = require('child_process');
try {
  const log = cp.execSync('npx -y vercel ls', { encoding: 'utf8' });
  const lines = log.split('\n');
  const deployments = lines.filter(l => l.includes('matteo-perin') || l.includes('Building') || l.includes('Ready'));
  console.log(deployments.join('\n'));
} catch (e) {
  console.error(e.message);
}
