import Table from 'rc-table'
import { timeBetweenTimestamps } from '../lib/utils/dates'

export default ({ commodityOrders }) => {
  return (
    <>
      {!commodityOrders && <div className='loading-bar' style={{ marginTop: '.75rem' }} />}
      {commodityOrders &&
        <Table
          className='data-table--mini data-table--striped scrollable'
          columns={[
            {
              title: 'Location',
              dataIndex: 'stationName',
              key: 'stationName',
              align: 'left',
              className: 'max-width-mobile',
              render: (v, r) =>
                <>
                  {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
                  <div className='is-visible-mobile'>
                    <table className='data-table--mini data-table--compact data-table--two-equal-columns'>
                      <tbody style={{ textTransform: 'uppercase' }}>
                        <tr>
                          <td><span class='data-table__label'>Demand</span>{r.demand.toLocaleString()} T</td>
                          <td><span class='data-table__label'>Price</span>{r.sellPrice.toLocaleString()} CR</td>
                        </tr>
                      </tbody>
                    </table>
                    <small style={{ textTransform: 'none' }}>Updated {timeBetweenTimestamps(r.updatedAt)} ago</small>
                  </div>
                </>
            },
            {
              title: 'Updated',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile',
              render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)} ago</span>
            },
            {
              title: 'Demand',
              dataIndex: 'demand',
              key: 'demand',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile',
              render: (v) => <>{v.toLocaleString()} T</>
            },
            {
              title: 'Price',
              dataIndex: 'sellPrice',
              key: 'sellPrice',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile',
              render: (v) => <>{v.toLocaleString()} CR</>
            }
          ]}
          data={commodityOrders}
        />}
    </>
  )
}
