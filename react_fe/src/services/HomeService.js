import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const unwrap = (res) => ({ data: res.data.data });

const HomeService = {
  getDailyOutfit: () => ApiClient.get(ApiUrl.HOME_OUTFIT_DAILY).then(unwrap),
  getRelaxOutfit: () => ApiClient.get(ApiUrl.HOME_OUTFIT_RELAX).then(unwrap),
  getAfterWorkOutfit: () => ApiClient.get(ApiUrl.HOME_OUTFIT_AFTER_WORK).then(unwrap),
};

export default HomeService;
