export default {
  // meEndpoint: '/auth/me',

  // loginEndpoint: '/jwt/login',
  loginEndpoint: '/auth/token/request',
  detailEndpoint: 'auth/token/detail',
  registerEndpoint: '/jwt/register',
  storageTokenKeyName: 'accessToken',
  onTokenExpiration: 'refreshToken', // logout | refreshToken
  userData: 'userData'
}
