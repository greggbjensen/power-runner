import * as globby from 'globby';
import * as path from 'path';
import { IScript } from '../../app/core/models';

export class NodeScriptService {

  public async listAsync(fileGlobs: string[]): Promise<IScript[]> {

    const files = await globby(fileGlobs);
    const scripts = files.map<IScript>(s => {
      const directory = path.dirname(s);
      return {
        directory,
        module: path.basename(directory),
        name: path.basename(s)
      };
    });

    return scripts;
  }
}
