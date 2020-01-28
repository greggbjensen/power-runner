import { SaveAsType } from './save-as-type.enum';

export interface IScriptProfile {
  id: string;
  name: string;
  saveAsType: SaveAsType;
  params: { [name: string]: any };
}
