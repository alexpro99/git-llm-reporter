export function parseArgs(args) {
  const commitRange = args.find(arg => !arg.startsWith('-'));
  const verbose = args.includes('-v') || args.includes('--verbose');
  const help = args.includes('-h') || args.includes('--help');

  const modelIndex = args.findIndex(arg => arg === '-m' || arg === '--model');
  const modelName = modelIndex !== -1 && args[modelIndex + 1] ? args[modelIndex + 1] : "gemini-1.5-pro";

  const branchIndex = args.findIndex(arg => arg === '-b' || arg === '--branch');
  const branch = branchIndex !== -1 && args[branchIndex + 1] ? args[branchIndex + 1] : null;

  const daysIndex = args.findIndex(arg => arg === '-d' || arg === '--days');
  const days = daysIndex !== -1 && args[daysIndex + 1] ? parseInt(args[daysIndex + 1], 10) : 7;

  const reportTypeIndex = args.findIndex(arg => arg === '--report-type');
  const reportType = reportTypeIndex !== -1 && args[reportTypeIndex + 1] ? args[reportTypeIndex + 1] : 'summary';

  return { commitRange, verbose, modelName, help, branch, days, reportType };
}
