import rawCountiesCsv from '../covid-19-data/us-counties.csv'
import rawStatesCsv from '../covid-19-data/us-states.csv'
import * as R from 'ramda'

/**
 * Sort by a list of props. This depends on browser sort being stable.
 */
const sortByProps = R.curry((keys, vals) =>
  R.apply(R.compose, R.map(R.compose(R.sortBy, R.prop), keys))(vals),
)

/**
 * Group by prop and dissociate prop from grouped records.
 */
const groupByDissoc = R.curry((k, vals) =>
  R.pipe(R.groupBy(R.prop(k)), R.map(R.map(R.dissoc(k))))(vals),
)

/**
 * Merge all records, summing specific fields.
 * The non-summed fields will be taken from the first record.
 */
const sumFields = R.curry((picker, vals) =>
  R.reduce(
    (current, val) => R.mergeWith(R.add, current, picker(val)),
    R.head(vals) || {},
    R.tail(vals),
  ),
)

// Pre-sort CSV data so it's easier to use below.
const countiesCsv = sortByProps(['state', 'county', 'date'], rawCountiesCsv)
const statesCsv = sortByProps(['state', 'date'], rawStatesCsv)

/**
 * Simple list of states, drawn from both sets of data for completeness.
 */
export const states = R.pipe(
  R.unnest,
  R.pluck('state'),
  R.uniq,
  R.sortBy(R.identity),
)([statesCsv, countiesCsv])

/**
 * Counties by state.
 */
export const counties = R.pipe(
  R.groupBy(R.prop('state')),
  R.map(R.pipe(R.pluck('county'), R.uniq, R.sortBy(R.identity))),
)(countiesCsv)

/**
 * Data by state.
 */
export const statesData = groupByDissoc('state', statesCsv)

/**
 * Data by state/county.
 */
export const countiesData = R.pipe(
  R.map(row => R.assoc('state/county', `${row.state}/${row.county}`, row)),
  R.map(R.omit(['state', 'county'])),
  groupByDissoc('state/county'),
)(countiesCsv)

/**
 * National data summed from states.
 */
export const nationData = R.pipe(
  R.map(R.pick(['date', 'cases', 'deaths'])),
  R.groupBy(R.prop('date')),
  R.map(sumFields(R.pick(['cases', 'deaths']))),
  R.values,
  R.sortBy(R.prop('date')),
)(statesCsv)

/**
 * Get data at depth.
 */
export const getData = path =>
  !path || path.length === 0
    ? nationData
    : path.length === 1
    ? statesData[path[0]]
    : countiesData[path.join('/')]
