import * as fs from 'fs';
import * as path from 'path';
import { Md5 } from 'ts-md5/dist/md5';
import * as XRegExp from 'xregexp';
import { IScript, IScriptParam, ParamType } from '../../app/core/models';

export class ScriptParser {

  // Handle # comments.
  private static readonly ScriptAttributesParamRegex = /^\s*(?:\[?(.*)\])?\s*\$([\w]+)\s*(?:=([^#]+)\s*)?/is;

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
        const paramList = paramText.split(/,[^[]*/); // Trim out comments.
        console.log('LIST', paramList);
        scriptParams = paramList.map(i => this.parseParam(i));
      } else {
        scriptParams = [];
      }
    } catch (err) {
      console.error(err);
      scriptParams = [];
    }

    console.log(scriptParams);

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
    console.log('LINE', paramLine);

    const match = ScriptParser.ScriptAttributesParamRegex.exec(paramLine);
    if (match) {
      const attributes = match[1];
      const name = match[2];
      let value: any = match[3];
      console.log('MATCH', attributes, name, value);

      param = {
        name,
        type: ParamType.String,
      } as IScriptParam;

      if (attributes) {
        const attributesList = attributes.replace('[', '').split(']');
        attributesList.forEach(a => {
          if (a.includes('(')) {
            this.applyAttribute(param, a);
          } else {
            this.setParamType(param, a);
          }
        });
      }

      if (value) {
        value = value.trim().replace(/^['"]/, '').replace(/['"]$/, '');
      }

      const defaultValue = this.normalizeValue(param, value);
      param.default = defaultValue;
      param.value = defaultValue;
    }

    return param;
  }

  private normalizeValue(param: IScriptParam, value: any): any {
    let result = value;

    if (result && result.toLowerCase() === '$null') {
      result = null;
    }

    switch (param.type) {
      case ParamType.Switch:
      case ParamType.Boolean:
        result = value.toLowerCase() === '$true';
        break;

      default:
        break;
    }

    return result || '';
  }

  private setParamType(param: IScriptParam, attribute: string): void {
    switch (attribute.toLowerCase()) {
      case 'string':
        param.type = ParamType.String;
        break;

      case 'securestring':
        param.type = ParamType.SecureString;
        break;

      case 'switch':
        param.type = ParamType.Switch;
        break;

      case 'bool':
        param.type = ParamType.Boolean;
        break;

      case 'validateset':
        param.type = ParamType.Set;
        break;
    }
  }

  private applyAttribute(param: IScriptParam, attribute: string): void {
    const parts = attribute.split(/[()]/);
    const type = parts[0].toLowerCase();
    const params = parts[1].split(',');

    switch (type) {
      case 'validateset':
        const set = params.map(p => p.replace(/^\s*["']/, '').replace(/["']\s*$/, ''));
        param.type = ParamType.Set;
        param.validation = { set };
        break;

      default:
        break;
    }
  }
}
