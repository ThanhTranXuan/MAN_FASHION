import ApiClient, { uploadClient } from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const ProfileService = {
  getProfile: () => ApiClient.get(ApiUrl.PROFILE),
  updateProfile: (data) => ApiClient.put(ApiUrl.UPDATE_PROFILE, data),
  updateAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return uploadClient.put(ApiUrl.UPDATE_AVATAR, formData);
  },
  changePassword: (data) => ApiClient.put(ApiUrl.CHANGE_PASSWORD, data),
  deleteAccount: () => ApiClient.delete(ApiUrl.DELETE_ACCOUNT),
};

export default ProfileService;
