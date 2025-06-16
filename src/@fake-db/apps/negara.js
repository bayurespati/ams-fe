// ** Mock Adapter
import mock from 'src/@fake-db/mock'

const data = {
  negara: [
    {
      id: 1,
      nama: 'Indonesia',
      alias: 'IDN'
    },
    {
      id: 2,
      nama: 'Malaysia',
      alias: 'MYS'
    },
    {
      id: 3,
      nama: 'Singapura',
      alias: 'SGP'
    },
    {
      id: 4,
      nama: 'Jepang',
      alias: 'JPN'
    },
    {
      id: 5,
      nama: 'Thailand',
      alias: 'THA'
    }
  ]
}

// ------------------------------------------------
// GET: Return Country List
// ------------------------------------------------
mock.onGet('/apps/negara/data').reply(config => {
  const { q = '' } = config.params
  const queryLowered = q.toLowerCase()

  const filteredData = data.negara.filter(
    negara =>
      negara.nama.toLowerCase().includes(queryLowered) ||
      negara.alias.some(i => i.toLowerCase().startsWith(queryLowered))
  )

  return [
    200,
    {
      params: config.params,
      allData: data.negara,
      negara: filteredData,
      total: filteredData.length
    }
  ]
})
