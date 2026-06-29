import ApiClient, { uploadClient } from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const ProfileService = {

  getProfile: () =>
    ApiClient.get(ApiUrl.PROFILE).then(res => {

      if (res.data && res.data.data) {
        const user = res.data.data;


        if (user.address) {
          const parts = user.address.split(', ');

          user.addressStreet = parts[0] || '';
          user.addressWard = parts[1] || '';
          user.addressDistrict = parts[2] || '';
          user.addressCity = parts[3] || '';
        }
      }




      return res;
    }),
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
