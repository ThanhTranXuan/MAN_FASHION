import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const UserService = {
  getAll: (params) => ApiClient.get(ApiUrl.ALL_USERS, { params }),
};

export default UserService;
