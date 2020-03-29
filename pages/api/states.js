import {states} from '../../lib/data'

export default (req, res) => {
  res.status(200).json(states)
}
