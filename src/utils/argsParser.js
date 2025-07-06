export function parseArgs(args) {
  const commitRange = args.find(arg => !arg.startsWith('-'));
  const verbose = args.includes('-v') || args.includes('--verbose');
  const help = args.includes('-h') || args.includes('--help');
  
  const modelIndex = args.findIndex(arg => arg === '-m' || arg === '--model');
  const modelName = modelIndex !== -1 && args[modelIndex + 1] ? args[modelIndex + 1] : "gemini-1.5-pro";

  console.log(`Parsed arguments: ${JSON.stringify({ commitRange, verbose, modelName, help })}`);

  return { commitRange, verbose, modelName, help };
}
