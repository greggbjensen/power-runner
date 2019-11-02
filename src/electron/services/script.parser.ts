import * as fs from 'fs';
import * as path from 'path';
import * as XRegExp from 'xregexp';
import { Md5 } from 'ts-md5/dist/md5';
import { IScript, IScriptParam, ParamType } from '../../app/core/models';

export class ScriptParser {

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

    // SourceRef: https://stackoverflow.com/questions/546433/regular-expression-to-match-balanced-parentheses
    let scriptParams: IScriptParam[];
    try {
      const match = XRegExp.matchRecursive(content, '\\(', '\\)');
      if (match && match[0]) {
        const paramText = match[0].trim();
        const paramList = paramText.split(',');
        scriptParams = paramList.map(i => this.parseParam(i));
      } else {
        scriptParams = [];
      }
    } catch (err) {
      console.error(err);
      scriptParams = [];
    }

    const directory = path.dirname(filePath);
    const id = Md5.hashStr(filePath) as string;
    const script: IScript = {
      id,
      directory,
      module: path.basename(directory),
      name: path.basename(filePath),
      params: scriptParams
    };

    return script;
  }

  private parseParam(paramLine: string): IScriptParam {
    let param: IScriptParam = null;
    const match = ScriptParser.ScriptAttributesParamRegex.exec(paramLine);
    if (match) {
      const attributes = match[1];
      if (attributes) {
        const attributesList = attributes.replace('[', '').split(']');
        console.log(attributesList);
      }
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
