import dynamic from 'next/dynamic'
import Router from 'next/router'
import {useRouter} from 'next/router'
import {ResponsiveLine} from '@nivo/line'
import * as R from 'ramda'
import * as Final from 'react-final-form'
import useSWR from 'swr'
import {ConnectedField} from '@welcome-ui/connected-field'
import {Select} from '@welcome-ui/select'
import {Box} from '@xstyled/styled-components'
import Layout from '../components/Layout'

let fetcher
try {
  fetcher = url => fetch(url).then(r => r.json())
} catch (e) {
  // SSR
}

const toOption = s => ({value: s, label: s})

const Page = () => {
  const {
    query: {slug = [], slug: [state, county] = []},
  } = useRouter()

  const {data: states} = useSWR(`/api/states`, fetcher)
  const {data: counties} = useSWR(`/api/counties`, fetcher)
  const {data} = useSWR(`/api/data${slug.map(s => `/${s}`).join('')}`, fetcher)

  const stateOptions = React.useMemo(() => {
    const os = (states || []).map(toOption)
    os.unshift({value: 'all', label: 'All states'})
    return os
  }, [states])

  const countyOptions = React.useMemo(() => {
    const os = (counties?.[state] || []).map(toOption)
    os.unshift({value: 'all', label: 'All counties'})
    return os
  }, [counties, state])

  const [graphData, setGraphData] = React.useState([])

  React.useEffect(() => {
    if (data) {
      setGraphData(data)
    }
  }, [data])

  const cases = React.useMemo(
    () => ({
      id: 'cases',
      data: graphData.map(row => ({
        x: row.date,
        y: row.cases,
      })),
    }),
    [graphData],
  )

  const deaths = React.useMemo(
    () => ({
      id: 'deaths',
      data: graphData.map(row => ({
        x: row.date,
        y: row.deaths,
      })),
    }),
    [graphData],
  )

  const initialValues = React.useMemo(
    () => ({
      state: state || 'all',
      county: county || 'all',
    }),
    [state, county],
  )

  const onChange = React.useCallback(
    ({values}) => {
      if (!R.equals(values, initialValues)) {
        if (values.state === 'all') {
          Router.push('/')
        } else {
          Router.push(
            '/[...slug]',
            values.state !== initialValues.state || values.county === 'all'
              ? `/${values.state}`
              : `/${values.state}/${values.county}`,
          )
        }
      }
    },
    [initialValues],
  )

  return (
    <Layout>
      <Final.Form
        initialValues={initialValues}
        onSubmit={() => false}
        render={({handleSubmit}) => (
          <>
            <Final.FormSpy onChange={onChange} />
            <form onSubmit={handleSubmit}>
              <Box row ml={-10}>
                <Box col={{xs: 1, sm: true}} pl={10} py={5}>
                  <ConnectedField
                    name="state"
                    label="State"
                    component={Select}
                    options={stateOptions}
                    isSearchable={true}
                  />
                </Box>
                <Box col={{xs: 1, sm: true}} pl={10} py={5}>
                  <ConnectedField
                    name="county"
                    label="County"
                    component={Select}
                    options={countyOptions}
                    isSearchable={true}
                  />
                </Box>
              </Box>
            </form>
          </>
        )}
      />
      <div
        style={{
          height: '66vw',
          maxHeight: '80vh',
        }}
      >
        <ResponsiveLine
          animate={true}
          axisBottom={{
            format: '%b %d',
            tickValues: 'every 4 days',
          }}
          curve="monotoneX"
          data={[cases, deaths]}
          enablePointLabel={true}
          margin={{top: 50, right: 110, bottom: 50, left: 60}}
          xFormat="time:%Y-%m-%d"
          xScale={{type: 'time', format: '%Y-%m-%d', precision: 'day'}}
          legends={[
            {
              anchor: 'bottom-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              effects: [
                {
                  on: 'hover',
                  style: {
                    itemBackground: 'rgba(0, 0, 0, .03)',
                    itemOpacity: 1,
                  },
                },
              ],
            },
          ]}
        />
      </div>
    </Layout>
  )
}

// SSR isn't working yet
export default dynamic(Promise.resolve(Page), {ssr: false})
