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
      title: 'Purchase Order',
      path: '/purchase-order',
      icon: 'tabler:notes'
    },
    {
      title: 'Aset',
      icon: 'tabler:package',
      children: [
        { title: 'List Aset', path: '/aset/master-data' },
        { title: 'Aset Masuk', path: '/aset/aset-masuk' },
        { title: 'Aset Keluar', path: '/aset/aset-keluar' },
        { title: 'Perbaikan', path: '/aset/perbaikan' },
        { title: 'Dismantle', path: '/aset/dismantle' },
        { title: 'Approval', path: '/aset/approval' }
      ]
    },
    {
      title: 'Master Data',
      icon: 'tabler:settings',
      children: [
        { title: 'Negara', path: '/pengaturan/negara' },
        { title: 'Kota', path: '/pengaturan/kota' },
        { title: 'Varietas', path: '/pengaturan/variety' },
        { title: 'Tipe', path: '/pengaturan/type' },
        { title: 'Brand', path: '/pengaturan/brand' },
        { title: 'Warehouse', path: '/pengaturan/warehouse' }
      ]
    },
    {
      title: 'Access Control',
      path: '/acl',
      icon: 'tabler:shield'
    }
  ]
}

export default navigation
