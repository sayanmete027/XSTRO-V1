import { pathToFileURL } from 'url';
import { join, extname } from 'path';
import { readdir } from 'fs/promises';
import { LANG } from '#src';

export async function loadPlugins(): Promise<void> {
  const pluginsDir: string = join('plugins');

  const files = await readdir(pluginsDir, { withFileTypes: true });
  await Promise.all(
    files.map(async (file) => {
      const fullPath: string = join(pluginsDir, file.name);
      if (extname(file.name) === '.js') {
        try {
          const fileUrl: string = pathToFileURL(fullPath).href;
          await import(fileUrl);
        } catch (err) {
          console.log('ERROR', `${file.name}: ${(err as Error).message}`);
        }
      }
    })
  );
  console.log(LANG.PLUGINS);
}
