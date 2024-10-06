import Table from 'rc-table'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import TradeBracketIcon from './trade-bracket'
import StationIcon from './station-icon'
import { UNLIMTED_DEMAND_TEXT, NO_DEMAND_TEXT } from 'lib/consts'

export default ({ commodityOrders }) => {
  return (
    <>
      {!commodityOrders && <div className='loading-bar loading-bar--table-row' />}
      {commodityOrders &&
        <Table
          className='data-table--mini data-table--striped scrollable'
          columns={[
            {
              title: 'Importers in system',
              dataIndex: 'stationName',
              key: 'stationName',
              align: 'left',
              className: 'max-width-mobile',
              render: (v, r) =>
                <>
                  <StationIcon stationType={r.fleetCarrier === 1 ? 'Fleet Carrier' : r.stationType} />
                  {r.fleetCarrier === 1 && 'Fleet Carrier '}{r.stationName}
                  {r.distanceToArrival !== null && <small className='text-no-transform'> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
                  <div className='is-visible-mobile'>
                    <table className='data-table--mini data-table--compact two-column-table'>
                      <tbody style={{ textTransform: 'uppercase' }}>
                        <tr>
                          <td>
                            <span className='data-table__label'>Demand</span>
                            {r.demandBracket !== 0 && r.demand > 0 && <TradeBracketIcon bracket={r.demandBracket} />}
                            {r.demandBracket === 0
                              ? <small>{NO_DEMAND_TEXT}</small>
                              : v > 0 ? `${v.toLocaleString()} T` : <small>{UNLIMTED_DEMAND_TEXT}</small>
                            }
                          </td>
                          <td><span className='data-table__label'>Price</span>{r.sellPrice.toLocaleString()} CR</td>
                        </tr>
                      </tbody>
                    </table>
                    <small style={{ textTransform: 'none' }}>{timeBetweenTimestamps(r.updatedAt)} ago</small>
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
              render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)}</span>
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
                  {r.demandBracket === 0
                    ? <small>{NO_DEMAND_TEXT}</small>
                    : v > 0 ? `${v.toLocaleString()} T` : <small>{UNLIMTED_DEMAND_TEXT}</small>
                  }
                  {r.demandBracket !== 0 && r.demand > 0 && <TradeBracketIcon bracket={r.demandBracket} />}
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
          rowKey='commodityId'
        />}
    </>
  )
}
