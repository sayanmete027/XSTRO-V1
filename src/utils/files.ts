import { join, extname } from 'path';
import { readdir } from 'fs/promises';

export const loadPlugins = async (directory:string) => {
  try {
    const files = await readdir(directory);
    return Promise.all(
      files
        .filter((file) => extname(file).toLowerCase() === ".js")
        .map((file) => require(join(directory, file)))
    );
  } catch (error) {
    console.error("Error reading and requiring files:", error);
    throw error;
  }
};
