const BASE_URL = "https://ec7dd1daaf00.ngrok-free.app/";

const PERMISSIONS_MODULES = "permission-modules";
const ROLES_MODULES = "role-modules";

// ADMIN ROUTES
const ADMIN = "/admin";
const AUTH_BOOTSTRAP_SUPERADMIN = "/auth/bootstrap-superadmin";
const AUTH_LOGIN = "/auth/login";
const USERS = "/users";
const TOGGLE_ACTIVE = "/toggle-active";
const CHANGE_PASSWORD = "/me/change-password";
const RESET_PASSWORD = "/reset-password";
const VERIFY_OTP = "/verify-otp";
const RESEND_OTP = ADMIN+AUTH_LOGIN+"/resend-otp";
const CLIENT_USER = "/client-user";
const STATUS = "/status";
const BLOCK = "/block";
const BLOCK_CLIENT = CLIENT_USER+BLOCK;
const LIST_PACKAGES ="/packages";
const RATE_CONFIG_BASE = "/rateConfig"
const RATE_CONFIG="/rate-config"
const RATE_CONFIGS="/rate-configs"

const GET_RATES = RATE_CONFIG_BASE + RATE_CONFIG;
const UPDATE_RATES = RATE_CONFIG_BASE + RATE_CONFIGS;

const ANALYTICS = "/analystics";
const KPIS = "/kpis";

const ANALYTICS_USERS_KPIS = ANALYTICS + USERS + KPIS;
const ANALYTICS_USERS_KPIS_WEEKLY_SERIRES = ANALYTICS + USERS + "/weekly-series";
const FEEDBACKS="/feedbacks"
const ADMIN_AUDIT_LISTING = ADMIN+ADMIN+"s"+"/audits/list"
export {
  BASE_URL,
  PERMISSIONS_MODULES,
  ROLES_MODULES,
  // ADMIN ROUTES START
  ADMIN,
  AUTH_BOOTSTRAP_SUPERADMIN,
  AUTH_LOGIN,
  USERS,
  TOGGLE_ACTIVE,
  CHANGE_PASSWORD,
  RESET_PASSWORD,
  VERIFY_OTP,
  RESEND_OTP,
  ADMIN_AUDIT_LISTING,
  // ADMIN ROUTES END
  //client user
  CLIENT_USER,
  STATUS,
  BLOCK_CLIENT,
  // PACKAGES
  LIST_PACKAGES,
  GET_RATES,
  UPDATE_RATES,

  // ANALYTICS
  ANALYTICS_USERS_KPIS,
  ANALYTICS_USERS_KPIS_WEEKLY_SERIRES,
  ANALYTICS,
  FEEDBACKS
};