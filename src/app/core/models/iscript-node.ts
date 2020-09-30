import { IScriptFile } from './iscript-file';

export interface IScriptNode {
  name: string;
  children?: IScriptNode[];
  script?: IScriptFile;
}
