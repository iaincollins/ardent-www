import Table from 'rc-table'
import { timeBetweenTimestamps } from '../lib/utils/dates'
import TradeBracketIcon from './trade-bracket'

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
                    <table className='data-table--mini data-table--compact two-column-table'>
                      <tbody style={{ textTransform: 'uppercase' }}>
                        <tr>
                          <td>
                            <span className='data-table__label'>Demand</span>
                            <TradeBracketIcon bracket={r.demandBracket} />
                            {r.demand > 0 ? `${r.demand.toLocaleString()} T` : <small>No demand</small>}
                          </td>
                          <td><span className='data-table__label'>Price</span>{r.sellPrice.toLocaleString()} CR</td>
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
              render: (v, r) =>
                <>
                  {v > 0 ? `${v.toLocaleString()} T` : <small>No demand</small>}
                  <TradeBracketIcon bracket={r.demandBracket} />
                </>
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
