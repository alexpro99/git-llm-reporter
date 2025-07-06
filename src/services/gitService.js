import simpleGit from "simple-git";

export async function getCommitLogs(range) {
  const git = simpleGit();
  if (!range) {
    console.error(
      "Error: Debes proporcionar un rango de commits. Ejemplo: 'main..develop'"
    );
    process.exit(1);
  }

  try {
    const log = await git.log({
      from: range.split("..",)[0],
      to: range.split("..",)[1],
      "--pretty": "format:%ad || %an || %s",
      "--date": "iso",
    });

    if (!log.all || log.all.length === 0) {
      console.log("No se encontraron commits en el rango especificado.");
      return null;
    }

    const formattedCommits = log.all
      .map((c) => `${c.date} | ${c.author_name} | ${c.message}`)
      .join("\n");
    return formattedCommits;
  } catch (error) {
    console.error("Error al obtener los logs de Git:", error);
    return null;
  }
}