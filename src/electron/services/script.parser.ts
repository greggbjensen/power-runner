import * as fs from 'fs';
import * as path from 'path';
import { IScript, IScriptParam, ParamType } from '../../app/core/models';

export class ScriptParser {
  private static readonly ScriptParamsRegex = /^\s*param\s*\((.*[^\]])\)/is;
  private static readonly ScriptAttributesParamRegex = /^\s*(?:\[(.*)\])?\s*\$([\w]+)\s*(?:=(.+)\s*)?/is;

  private static readFile(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  public async parseScript(filePath: string): Promise<IScript> {

    const content = await ScriptParser.readFile(filePath);
    const match = ScriptParser.ScriptParamsRegex.exec(content);
    let scriptParms: IScriptParam[];
    if (match) {
      const paramText = match[1];
      const paramList = paramText.split(',');
      scriptParms = paramList.map(i => this.parseParam(i));
    } else {
      console.log('No params');
      scriptParms = [];
    }

    const directory = path.dirname(filePath);
    const script: IScript = {
      directory,
      module: path.basename(directory),
      name: path.basename(filePath),
      params: scriptParms
    };

    return script;
  }

  private parseParam(paramLine: string): IScriptParam {
    let param: IScriptParam = null;
    const match = ScriptParser.ScriptAttributesParamRegex.exec(paramLine);
    if (match) {
      const attributes = match[1];
      const name = match[2];
      let value = match[3];
      if (value) {
        value = value.trim().replace(/^['"]/, '').replace(/['"]$/, '');
      }

      param = {
        name,
        type: ParamType.String,
        value: value || ''
      };
    }

    return param;
  }
}
