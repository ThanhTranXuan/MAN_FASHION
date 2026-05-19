import ApiClient from 'api/ApiClient';
import ApiUrl from 'constants/ApiUrl';

const NewsletterService = {
  subscribe: (email) =>
    ApiClient.post(ApiUrl.NEWSLETTER_SUBSCRIBE, { email }).then((res) => res.data),
};

export default NewsletterService;
