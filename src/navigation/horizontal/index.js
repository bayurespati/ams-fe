const navigation = () => {
  return [
    {
      title: 'Home',
      path: '/home',
      icon: 'tabler:smart-home'
    },
    {
      title: 'Plan',
      path: '/plan',
      icon: 'tabler:notes'
    },
    {
      title: 'Aset Masuk',
      path: '/aset-masuk',
      icon: 'tabler:package-import'
    },
    {
      title: 'Pengaturan',
      icon: 'tabler:settings',
      children: [
        {
          title: 'Negara',
          path: '/pengaturan/negara'
        },
        {
          title: 'Kota',
          path: '/pengaturan/kota'
        }
      ]
    },
    {
      path: '/acl',
      action: 'read',
      subject: 'acl-page',
      title: 'Access Control',
      icon: 'tabler:shield'
    }
  ]
}

export default navigation
