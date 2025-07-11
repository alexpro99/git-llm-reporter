export function parseArgs(args) {
  const commitRange = args.find((arg) => !arg.startsWith("-"));
  const verbose = args.includes("-v") || args.includes("--verbose");
  const help = args.includes("-h") || args.includes("--help");
  const deepDive = args.includes("--deep-dive");

  const branchIndex = args.findIndex(
    (arg) => arg === "-b" || arg === "--branch"
  );
  const branch =
    branchIndex !== -1 && args[branchIndex + 1] ? args[branchIndex + 1] : null;

  const daysIndex = args.findIndex((arg) => arg === "-d" || arg === "--days");
  const days =
    daysIndex !== -1 && args[daysIndex + 1]
      ? parseInt(args[daysIndex + 1], 10)
      : 7;

  const reportTypeIndex = args.findIndex((arg) => arg === "--report-type");
  const reportType =
    reportTypeIndex !== -1 && args[reportTypeIndex + 1]
      ? args[reportTypeIndex + 1]
      : "summary";

  const chunkSizeIndex = args.findIndex((arg) => arg === "--chunk-size");
  const chunkSize =
    chunkSizeIndex !== -1 && args[chunkSizeIndex + 1]
      ? parseInt(args[chunkSizeIndex + 1], 10)
      : process.env.CHUNK_SIZE || 5;

  const providerIndex = args.findIndex((arg) => arg === "--provider");
  const provider =
    providerIndex !== -1 && args[providerIndex + 1]
      ? args[providerIndex + 1]
      : process.env.DEFAULT_PROVIDER || "gemini";

  const modelIndex = args.findIndex((arg) => arg === "-m" || arg === "--model");
  const modelName =
    modelIndex !== -1 && args[modelIndex + 1]
      ? args[modelIndex + 1]
      : getDefaultModelNameByProvider(provider);

  const devFilterIndex = args.findIndex((arg) => arg === "--dev-filter");
  const devFilter =
    devFilterIndex !== -1 && args[devFilterIndex + 1]
      ? args[devFilterIndex + 1]
      : null;

  const outPathIndex = args.findIndex(
    (arg) => arg === "-o" || arg === "--out"
  );
  const outPath =
    outPathIndex !== -1 && args[outPathIndex + 1]
      ? args[outPathIndex + 1]
      : null;

  return {
    commitRange,
    verbose,
    modelName,
    help,
    branch,
    days,
    reportType,
    deepDive,
    chunkSize,
    provider,
    devFilter,
    outPath,
  };
}

function getDefaultModelNameByProvider(provider) {
  switch (provider) {
    case "gemini":
      return "gemini-2.5-flash";
    case "ollama":
      return "gemma3:4b";
  }
}
