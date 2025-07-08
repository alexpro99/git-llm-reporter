import simpleGit from "simple-git";

const git = simpleGit();

const FIELD_SEPARATOR = "|||";
const RECORD_SEPARATOR = "%";
const GIT_LOG_FORMAT = `--pretty=format:%H${FIELD_SEPARATOR}%ad${FIELD_SEPARATOR}%an${FIELD_SEPARATOR}%s${RECORD_SEPARATOR}`;

const parseLogOutput = (output) => {
  if (!output) {
    return [];
  }
  return output
    .split(RECORD_SEPARATOR)
    .filter((line) => line.trim() !== "")
    .map((line) => {
      const [hash, date, author, message] = line.split(FIELD_SEPARATOR);
      return { hash, date, author, message: message ? message.trim() : "" };
    });
};

export async function getCommitLogs(range, devFilter) {
  if (!range) {
    console.error(
      "Error: Debes proporcionar un rango de commits. Ejemplo: 'main..develop'"
    );
    process.exit(1);
  }

  try {
    const logArgs = [
      "log",
      `${range.split("..")[0]}..${range.split("..")[1]}`,
      GIT_LOG_FORMAT,
      "--date=iso",
    ];

    if (devFilter) {
      logArgs.push(`--author=${devFilter}`);
    }

    const logOutput = await git.raw(logArgs);

    const commits = parseLogOutput(logOutput);
    if (commits.length === 0) {
      console.log("No se encontraron commits en el rango especificado.");
    }
    return commits;
  } catch (error) {
    console.error("Error al obtener los logs de Git:", error);
    return [];
  }
}

export async function getCommitLogsByBranch(branch, days, devFilter) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const logArgs = [
      "log",
      branch,
      `--since=${since.toISOString()}`,
      GIT_LOG_FORMAT,
      "--date=iso",
    ];

    if (devFilter) {
      logArgs.push(`--author=${devFilter}`);
    }

    const logOutput = await git.raw(logArgs);

    const commits = parseLogOutput(logOutput);
    if (commits.length === 0) {
      console.log(
        `No se encontraron commits en la rama ${branch} en los últimos ${days} días.`
      );
    }
    return commits;
  } catch (error) {
    console.error("Error al obtener los logs de Git:", error);
    return [];
  }
}

export async function getCommitDiff(commitHash = '') {
  try {
    // The -m flag is added to ensure that diffs for merge commits are also displayed.

    const diff = await git.show(["-m", commitHash.replace('\n', '').trim()]);
    if (diff) {
      console.log(commitHash, "OK!");
    }
    return diff;
  } catch (error) {
    console.error(
      `Error al obtener el diff para el commit ${commitHash}: ${error}`
    );
    return null;
  }
}
