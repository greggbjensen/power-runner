import { IPowerShellAttribute } from './ipower-shell-attribute';

export interface IPowerShellParam {
  name: string;
  type: string;
  default: string;
  attributes: IPowerShellAttribute[];
}
