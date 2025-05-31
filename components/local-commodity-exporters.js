import { useEffect } from 'react'
import Table from 'rc-table'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import TradeBracketIcon from './trade-bracket'
import StationIcon from './station-icon'
import animateTableEffect from 'lib/animate-table-effect'

export default ({ commodityOrders }) => {
  useEffect(animateTableEffect)

  return (
    <>
      {!commodityOrders && <div className='loading-bar loading-bar--table-row' />}
      {commodityOrders &&
        <Table
          className='data-table--mini data-table--striped data-table--animated scrollable'
          columns={[
            {
              title: 'Exporters in system',
              dataIndex: 'stationName',
              key: 'stationName',
              align: 'left',
              className: 'max-width-mobile',
              render: (v, r) =>
                <>
                  <StationIcon station={r}>
                    {r.stationName}
                    {r.distanceToArrival !== null && <small className='text-no-transform'> {Math.round(r.distanceToArrival).toLocaleString()} Ls</small>}
                  </StationIcon>
                  <div className='is-visible-mobile'>
                    <table className='data-table--mini data-table--compact two-column-table'>
                      <tbody style={{ textTransform: 'uppercase' }}>
                        <tr>
                          <td>
                            <span className='data-table__label'>Stock</span>
                            <TradeBracketIcon bracket={r.stockBracket} />
                            {r.stock.toLocaleString()} T
                          </td>
                          <td className='text-right'><span className='data-table__label'>Price</span>{r.buyPrice.toLocaleString()} CR</td>
                        </tr>
                      </tbody>
                    </table>
                    <small>{timeBetweenTimestamps(r.updatedAt)} ago</small>
                  </div>
                </>
            },
            {
              title: 'Updated',
              dataIndex: 'updatedAt',
              key: 'updatedAt',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile no-wrap',
              render: (v) => <small>{timeBetweenTimestamps(v)}</small>
            },
            {
              title: 'Stock',
              dataIndex: 'stock',
              key: 'stock',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile no-wrap',
              render: (v, r) => <>{v.toLocaleString()} T<TradeBracketIcon bracket={r.stockBracket} /></>
            },
            {
              title: 'Price',
              dataIndex: 'buyPrice',
              key: 'buyPrice',
              align: 'right',
              width: 130,
              className: 'is-hidden-mobile no-wrap',
              render: (v) => <>{v.toLocaleString()} CR</>
            }
          ]}
          data={commodityOrders}
          rowKey={(r) => `local_commodity_exporters_${r.marketId}_${r.commodityName}`}
        />}
    </>
  )
}
