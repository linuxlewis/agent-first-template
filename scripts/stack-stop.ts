import { getStackPaths, killProcess, readMetadata, runCommand } from "./stack-shared.js";

const metadata = readMetadata();
const paths = getStackPaths();

if (metadata) {
	killProcess(metadata.pids.web);
	killProcess(metadata.pids.api);
	runCommand("docker", ["compose", "-p", metadata.projectName, "down", "-v", "--remove-orphans"]);
} else {
	runCommand("docker", ["compose", "-p", paths.projectName, "down", "-v", "--remove-orphans"]);
}

console.log(`stack stopped; artifacts kept in ${paths.dir}`);
