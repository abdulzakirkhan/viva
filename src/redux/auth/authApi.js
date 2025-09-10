
// src/redux/auth/authApi.js
import { api } from '../service';
import { ADMIN, AUTH_LOGIN, RESEND_OTP, VERIFY_OTP} from '../../constants/apiUrls';

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => {
        return {
          url:`${ADMIN}${AUTH_LOGIN}`,
          method: 'POST',
          body,
        };
      },
    }),
    verifyOtp: builder.mutation({
      query: (body) => {
        return {
          url:`${ADMIN}${AUTH_LOGIN}${VERIFY_OTP}`,
          method: 'POST',
          body,
        };
      },
    }),

    resendOtp: builder.mutation({
      query: (body) => {
        return {
          url:`${RESEND_OTP}`,
          method: 'POST',
          body,
        };
      },
    }),

  }),
});

export const { 
  useLoginMutation,
  useVerifyOtpMutation,
  useResendOtpMutation
} = authApi;