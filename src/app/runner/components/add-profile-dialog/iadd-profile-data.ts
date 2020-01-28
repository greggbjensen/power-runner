import { IScriptProfile } from 'src/app/core/models';

export interface IAddProfileData {
  title: string;
  profile: IScriptProfile;
  existingProfiles: IScriptProfile[];
}
