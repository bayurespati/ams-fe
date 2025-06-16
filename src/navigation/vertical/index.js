const navigation = () => {
  return [
    {
      title: 'Home',
      path: '/home',
      icon: 'tabler:smart-home',
      auth: false
    },
    {
      title: 'Plan',
      path: '/plan',
      icon: 'tabler:notes',
      auth: false
    },
    {
      title: 'Purchase Order',
      path: '/purchase-order',
      icon: 'tabler:notes',
      auth: false
    },
    {
      title: 'Aset',
      icon: 'tabler:package',
      children: [
        {
          title: 'Master Data',
          path: '/aset/master-data',
          auth: false
        },
        {
          title: 'Aset Masuk',
          path: '/aset/aset-masuk',
          auth: false
        },
        {
          title: 'Aset Keluar',
          path: '/aset/aset-keluar',
          auth: false
        },
        {
          title: 'Perbaikan',
          path: '/aset/perbaikan',
          auth: false
        },
        {
          title: 'Dismantle',
          path: '/aset/dismantle',
          auth: false
        }
      ],
      auth: false
    },
    {
      title: 'Pengaturan',
      icon: 'tabler:settings',
      children: [
        {
          title: 'Negara',
          path: '/pengaturan/negara',
          auth: false
        },
        {
          title: 'Kota',
          path: '/pengaturan/kota',
          auth: false
        },
        {
          title: 'Varietas',
          path: '/pengaturan/variety',
          auth: false
        },
        {
          title: 'Tipe',
          path: '/pengaturan/type',
          auth: false
        }
      ],
      auth: false
    },
    {
      path: '/acl',
      action: 'read',
      subject: 'acl-page',
      title: 'Access Control',
      icon: 'tabler:shield',
      auth: false
    }
  ]
}

export default navigation
