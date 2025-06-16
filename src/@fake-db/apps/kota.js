// ** Mock Adapter
import mock from 'src/@fake-db/mock'

const data = {
  kota: [
    {
      id: 1,
      nama: 'Bandar Lampung',
      alias: 'BDL'
    },
    {
      id: 2,
      nama: 'Jakarta',
      alias: 'JKT'
    },
    {
      id: 3,
      nama: 'Surabaya',
      alias: 'SUB'
    },
    {
      id: 4,
      nama: 'Palembang',
      alias: 'PLM'
    },
    {
      id: 5,
      nama: 'Medan',
      alias: 'MES'
    }
  ]
}

// ------------------------------------------------
// GET: Return Permissions List
// ------------------------------------------------
mock.onGet('/apps/kota/data').reply(config => {
  const { q = '' } = config.params
  const queryLowered = q.toLowerCase()

  const filteredData = data.kota.filter(
    kota => kota.nama.toLowerCase().includes(queryLowered) || kota.alias.toLowerCase().includes(queryLowered)
  )

  return [
    200,
    {
      params: config.params,
      allData: data.kota,
      kota: filteredData,
      total: filteredData.length
    }
  ]
})
