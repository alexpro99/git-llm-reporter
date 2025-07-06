import simpleGit from "simple-git";

const git = simpleGit();

const formatCommit = (c) => ({
  hash: c.hash,
  date: c.date,
  author: c.author_name,
  message: c.message,
});

export async function getCommitLogs(range) {
  if (!range) {
    console.error("Error: Debes proporcionar un rango de commits. Ejemplo: 'main..develop'");
    process.exit(1);
  }

  try {
    const log = await git.log({
      from: range.split("..")[0],
      to: range.split("..")[1],
      "--pretty": "format:%H || %ad || %an || %s",
      "--date": "iso",
    });

    if (!log.all || log.all.length === 0) {
      console.log("No se encontraron commits en el rango especificado.");
      return [];
    }

    return log.all.map(c => {
      const [hash, date, author, message] = c.split(' || ');
      return { hash, date, author, message };
    });
  } catch (error) {
    console.error("Error al obtener los logs de Git:", error);
    return [];
  }
}

export async function getCommitLogsByBranch(branch, days) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  try {
    const log = await git.log([
      branch,
      `--since=${since.toISOString()}`,
      "--pretty=format:%H || %ad || %an || %s",
      "--date=iso",
    ]);

    if (!log.all || log.all.length === 0) {
      console.log(`No se encontraron commits en la rama ${branch} en los últimos ${days} días.`);
      return [];
    }

    console.log(log.all)

    return log.all.map(c => {
        const [hash, date, author, message] = c.split(' || ');
        return { hash, date, author, message };
      });
  } catch (error) {
    console.error("Error al obtener los logs de Git:", error);
    return [];
  }
}

export async function getCommitDiff(commitHash) {
  try {
    return await git.show(commitHash);
  } catch (error) {
    console.error(`Error al obtener el diff para el commit ${commitHash}:`, error);
    return null;
  }
}
