import {statesData, countiesData} from '../../../lib/data'

export default (req, res) => {
  const {
    query: {path},
  } = req
  const [state, county] = path
  const data = county ? countiesData[`${state}/${county}`] : statesData[state]
  if (data) {
    res.status(200).json(data)
  } else {
    res.status(404).end('Not found')
  }
}
