import defaultFetch from '../../../utils/fetching/defaultFetch';
import { ZetkinSurvey } from '../../../utils/types/zetkin';

export default function getSurveys(orgId: string, fetch = defaultFetch) {
  return async (): Promise<ZetkinSurvey[]> => {
    const sIdRes = await fetch(`/orgs/${orgId}/surveys`);
    const sIdData = await sIdRes.json();
    return sIdData.data;
  };
}
