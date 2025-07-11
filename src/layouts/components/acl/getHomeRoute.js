const getHomeRoute = role => {
  switch (role) {
    case 'client':
      return '/acl'
    case 'admin':
    case 'user':
    default:
      return '/home'
  }
}

export default getHomeRoute
