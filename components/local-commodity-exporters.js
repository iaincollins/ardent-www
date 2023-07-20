import Table from 'rc-table'
import { timeBetweenTimestamps } from '../lib/utils/dates'
import TradeBracketIcon from './trade-bracket'
import StationIcon from './station-icon'

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
                  <StationIcon stationType={r.stationType} />
                  {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
                  {r.distanceToArrival && <small> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
                  <div className='is-visible-mobile'>
                    <table className='data-table--mini data-table--compact two-column-table'>
                      <tbody style={{ textTransform: 'uppercase' }}>
                        <tr>
                          <td>
                            <span className='data-table__label'>Stock</span>
                            <TradeBracketIcon bracket={r.stockBracket} />
                            {r.stock.toLocaleString()} T
                          </td>
                          <td><span className='data-table__label'>Price</span>{r.buyPrice.toLocaleString()} CR</td>
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
              title: 'Stock',
              dataIndex: 'stock',
              key: 'stock',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile',
              render: (v, r) => <>{v.toLocaleString()} T<TradeBracketIcon bracket={r.stockBracket} /></>
            },
            {
              title: 'Price',
              dataIndex: 'buyPrice',
              key: 'buyPrice',
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
