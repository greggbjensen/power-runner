import { IScriptFile } from '../../app/core/models';

export interface IUncachedScriptFile {
  file: IScriptFile;
  hash: string;
}
