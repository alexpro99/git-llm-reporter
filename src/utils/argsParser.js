export function parseArgs(args) {
  const commitRange = args.find(arg => !arg.startsWith('-'));
  const verbose = args.includes('-v') || args.includes('--verbose');
  const help = args.includes('-h') || args.includes('--help');
  const deepDive = args.includes('--deep-dive');

  const modelIndex = args.findIndex(arg => arg === '-m' || arg === '--model');
  const modelName = modelIndex !== -1 && args[modelIndex + 1] ? args[modelIndex + 1] : "gemini-2.5-pro";

  const branchIndex = args.findIndex(arg => arg === '-b' || arg === '--branch');
  const branch = branchIndex !== -1 && args[branchIndex + 1] ? args[branchIndex + 1] : null;

  const daysIndex = args.findIndex(arg => arg === '-d' || arg === '--days');
  const days = daysIndex !== -1 && args[daysIndex + 1] ? parseInt(args[daysIndex + 1], 10) : 7;

  const reportTypeIndex = args.findIndex(arg => arg === '--report-type');
  const reportType = reportTypeIndex !== -1 && args[reportTypeIndex + 1] ? args[reportTypeIndex + 1] : 'summary';

  const chunkSizeIndex = args.findIndex(arg => arg === '--chunk-size');
  const chunkSize = chunkSizeIndex !== -1 && args[chunkSizeIndex + 1] ? parseInt(args[chunkSizeIndex + 1], 10) : (process.env.CHUNK_SIZE || 5);

  return { commitRange, verbose, modelName, help, branch, days, reportType, deepDive, chunkSize };
}
