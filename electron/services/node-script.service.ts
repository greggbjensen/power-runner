import * as globby from 'globby';
import * as path from 'path';
import { IScript } from '../../src/app/core/models';

export class NodeScriptService {

    public async listAsync(fileGlobs: string[]): Promise<IScript[]> {
        const files = await globby(fileGlobs);
        const scripts = files.map<IScript>(s => ({
            module: path.dirname(s),
            name: path.basename(s)
        }));

        return scripts;
    }
}
