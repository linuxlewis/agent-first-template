import { getHarnessPaths, killProcess, readMetadata, runCommand } from "./shared.js";

const metadata = readMetadata();
const paths = getHarnessPaths();

if (metadata) {
	killProcess(metadata.pids.web);
	killProcess(metadata.pids.api);
	runCommand("docker", ["compose", "-p", metadata.projectName, "down", "-v", "--remove-orphans"]);
} else {
	runCommand("docker", ["compose", "-p", paths.projectName, "down", "-v", "--remove-orphans"]);
}

console.log(`harness stopped; artifacts kept in ${paths.dir}`);
