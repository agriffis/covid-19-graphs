import {counties} from '../../lib/data'

export default (req, res) => {
  res.status(200).json(counties)
}
