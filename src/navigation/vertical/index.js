const navigation = () => {
  return [
    {
      title: 'Home',
      path: '/home',
      icon: 'tabler:smart-home',
      auth: false,
      roles: ['Manager Gudang', 'Admin Gudang']
    },
    {
      title: 'Plan',
      path: '/plan',
      icon: 'tabler:notes',
      auth: false,
      roles: ['Manager Gudang', 'Admin Gudang']
    },
    {
      title: 'Purchase Order',
      path: '/purchase-order',
      icon: 'tabler:notes',
      auth: false,
      roles: ['Manager Gudang', 'Admin Gudang']
    },
    {
      title: 'Aset',
      icon: 'tabler:package',
      children: [
        {
          title: 'List Aset',
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
      auth: false,
      roles: ['Admin Gudang']
    },

    // 🔹 Menu Rekap Aset baru
    {
      title: 'Rekap Aset',
      icon: 'tabler:report',
      children: [
        {
          title: 'List Aset',
          path: '/rekap-aset/list-aset',
          auth: false
        },
        {
          title: 'Label Aset',
          path: '/rekap-aset/label-aset',
          auth: false
        }
      ],
      auth: false,
      roles: ['Manager Gudang', 'Admin Gudang']
    },

    {
      title: 'Master Data',
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
        },
        {
          title: 'Brand',
          path: '/pengaturan/brand',
          auth: false
        },
        {
          title: 'Company',
          path: '/pengaturan/company',
          auth: false
        },
        {
          title: 'Warehouse',
          path: '/pengaturan/warehouse',
          auth: false
        }
      ],
      auth: false,
      roles: ['Admin Gudang']
    },
    {
      path: '/acl',
      action: 'read',
      subject: 'acl-page',
      title: 'Access Control',
      icon: 'tabler:shield',
      auth: false,
      roles: ['Admin Gudang']
    }
  ]
}

const VerticalNavItems = () => {
  const storedUser = localStorage.getItem('userData')
  const user = storedUser ? JSON.parse(storedUser) : {}
  const role = user.role || 'guest'

  const filterMenu = items => {
    return items
      .filter(item => {
        // If roles are not defined, show to all
        if (!item.roles) return true

        return item.roles.includes(role)
      })
      .map(item => ({
        ...item,
        children: item.children ? filterMenu(item.children) : undefined
      }))
  }

  return filterMenu(navigation())
}

export default VerticalNavItems
