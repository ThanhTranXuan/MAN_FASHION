import ApiClient, { uploadClient } from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const ProfileService = {
  // getProfile: () => ApiClient.get(ApiUrl.PROFILE),
  getProfile: () => 
    ApiClient.get(ApiUrl.PROFILE).then(res => {
      // 1. Kiểm tra xem có dữ liệu trả về không
      if (res.data && res.data.data) {
        const user = res.data.data;
        
        // 2. Thực hiện băm chuỗi address ngay tại đây
        if (user.address) {
          const parts = user.address.split(', ');
          // Thêm các trường mới trực tiếp vào đối tượng user
          user.addressStreet = parts[0] || '';
          user.addressWard = parts[1] || '';
          user.addressDistrict = parts[2] || '';
          user.addressCity = parts[3] || '';
        }
      }
      
      // 3. QUAN TRỌNG: Trả về nguyên vẹn object res (vẫn còn đủ res.data.data)
      // Header sẽ đọc được res.data.data.avatarUrl như bình thường
      // Các trang Form sẽ đọc được res.data.data.addressStreet
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
