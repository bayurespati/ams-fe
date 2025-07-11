const authConfig = {
  meEndpoint: `${process.env.NEXT_PUBLIC_BASE_URL}auth/token/check`,
  detailUser: `${process.env.NEXT_PUBLIC_BASE_URL}auth/token/detail`,
  onTokenExpiration: 'logout'
}

export default authConfig
