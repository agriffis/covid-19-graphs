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
import * as libData from '../lib/data'
import {isBrowser} from '../lib/ssr'

const toOption = s => ({value: s, label: s})

const StateCountyForm = ({counties, initialValues, handleChange, states}) => {
  const stateOptions = React.useMemo(() => {
    const os = (states || []).map(toOption)
    os.unshift({value: 'all', label: 'All states'})
    return os
  }, [states])

  const countyOptions = React.useMemo(() => {
    const os = (counties?.[initialValues.state] || []).map(toOption)
    os.unshift({value: 'all', label: 'All counties'})
    return os
  }, [counties, initialValues.state])

  const onChange = React.useCallback(
    ({values, values: {state, county}, ...props}) => {
      if (!R.equals(values, initialValues)) {
        if (state !== initialValues.state) {
          county = 'all'
        }
        handleChange({
          ...props,
          values: {
            ...values,
            county,
          },
        })
      }
    },
    [initialValues],
  )

  return (
    isBrowser && (
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
    )
  )
}

const Page = ({initialData}) => {
  const {
    query: {slug = [], slug: [state = 'all', county = 'all'] = []},
  } = useRouter()

  const {data: states} = useSWR(`/api/states`, {
    initialData: initialData?.states,
  })
  const {data: counties} = useSWR(`/api/counties`, {
    initialData: initialData?.counties,
  })
  const {data} = useSWR(`/api/data${slug.map(s => `/${s}`).join('')}`, {
    initialData: initialData?.data,
  })

  const [graphData, setGraphData] = React.useState([])
  React.useEffect(() => {
    if (data) {
      setGraphData(data)
    }
  }, [data])

  const useGraphData = id =>
    React.useMemo(
      () => ({
        id,
        data: graphData.map(row => ({
          x: row.date,
          y: row[id],
        })),
      }),
      [graphData],
    )

  const cases = useGraphData('cases')
  const deaths = useGraphData('deaths')

  const handleChange = ({values}) => {
    if (values.state === 'all') {
      Router.push('/')
    } else {
      Router.push(
        '/[...slug]',
        values.county === 'all'
          ? `/${values.state}`
          : `/${values.state}/${values.county}`,
      )
    }
  }

  return (
    <Layout>
      <StateCountyForm
        counties={counties}
        states={states}
        initialValues={{county, state}}
        handleChange={handleChange}
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

export const getServerSideProps = async context => {
  const {params} = context

  // Index.js reuses this view, and params will be undefined there.
  const slug = params?.slug || []

  return {
    props: {
      initialData: {
        counties: libData.counties,
        states: libData.states,
        data: libData.getData(slug),
      },
    },
  }
}

export default Page
