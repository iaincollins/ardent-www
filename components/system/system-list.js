import Table from 'rc-table'
import { useRouter } from 'next/router'
import StationIcon from 'components/station-icon'
import { timeBetweenTimestamps } from 'lib/utils/dates'

module.exports = ({
  stationsInSystem,
}) => {
  const router = useRouter()

  return (
    <div className='fx__fade-in'>
      <div className='heading--with-underline'>
        <h2>Locations</h2>
      </div>
      <Table
        className='data-table data-table--striped Xdata-table--interactive data-table--animated'
        columns={[
          {
            title: 'Name',
            dataIndex: 'stationName',
            key: 'stationName',
            align: 'left',
            className: 'max-width-mobile',
            render: (v, r) =>
              <StationIcon station={r}>
                {r.stationType === 'FleetCarrier' && 'Fleet Carrier '}{v}
                <div className='is-visible-mobile'>
                  {r.bodyName &&
                    <small>
                      <i className='icarus-terminal-planet' />{' '} {r.bodyName}
                      <br />
                    </small>}
                  <small>{timeBetweenTimestamps(r.updatedAt)}</small>
                </div>
              </StationIcon>
          },
          {
            title: 'Location',
            dataIndex: 'bodyName',
            key: 'bodyName',
            align: 'right',
            className: 'is-hidden-mobile no-wrap',
            render: (v, r) =>
              <>
                {v &&
                  <small>
                    <i className='icarus-terminal-planet' /> {v}
                  </small>}
              </>
          },
          {
            title: 'Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            align: 'right',
            width: 130,
            className: 'is-hidden-mobile no-wrap',
            render: (v, r) => <small>{timeBetweenTimestamps(r.updatedAt)}</small>
          },
          {
            title: 'Distance',
            dataIndex: 'distanceToArrival',
            key: 'distanceToArrival',
            align: 'right',
            width: 130,
            className: 'no-wrap',
            render: (v) => <>{v !== null && Math.round(v).toLocaleString()} Ls</>
          }
        ]}
        data={stationsInSystem}
        rowKey={(r) => `station_${r.marketId}`}
      />
    </div>
  )
}