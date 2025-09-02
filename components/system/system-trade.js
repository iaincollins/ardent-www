import { useContext } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Collapsible from 'react-collapsible'
import { CollapsibleTrigger } from 'components/collapsible-trigger'
import { DialogContext } from 'lib/context'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Table from 'rc-table'
import CommodityImportersInSystem from 'components/commodity-importers/commodity-importers-in-system'
import CommodityExportersInSystem from 'components/commodity-exporters/commodity-exporters-in-system'
import CommodityImportersNearby from 'components/commodity-importers/commodity-importers-nearby'
import CommodityExportersNearby from 'components/commodity-exporters/commodity-exporters-nearby'
import CopyOnClick from 'components/copy-on-click'

import { NO_DEMAND_TEXT } from 'lib/consts'

module.exports = ({
  system,
  stationsInSystem,
  importOrders,
  exportOrders,
  rareGoods,
  lastUpdatedAt
}) => {
  const router = useRouter()
  const [, setDialog] = useContext(DialogContext)

  const activeTab = router.query?.slug?.[1] === 'imports'
    ? 1
    : 0

  return (
    <div className='fx__fade-in'>
      <div className='heading--with-underline'>
        <h2>Commodities</h2>
      </div>
      <p>
        {system?.systemName !== undefined &&
          <span className='fx__fade-in'>
            Trade data for <CopyOnClick>{system.systemName}</CopyOnClick> last updated {timeBetweenTimestamps(lastUpdatedAt)} ago
          </span>}
      </p>
      <Tabs
        selectedIndex={activeTab}
        onSelect={
          (index) => {
            const view = (index === 1) ? 'imports' : 'exports'
            router.push(`/system/${system.systemAddress}/${view}`)
          }
        }
      >
        <TabList>
          <Tab>
            <i style={{ lineHeight: '1.5rem', fontSize: '1.5rem', top: '-.15rem', position: 'relative' }} className='icarus-terminal-cargo-export' />
            <span className='is-hidden-mobile'>Exports</span>
            {/* {exportOrders && <span className='tab-badge'>{exportOrders.length}</span>} */}
          </Tab>
          <Tab>
            <i style={{ lineHeight: '1.5rem', fontSize: '1.5rem', top: '-.15rem', position: 'relative' }} className='icarus-terminal-cargo-import' />
            <span className='is-hidden-mobile'>Imports</span>
            {/* {importOrders && <span className='tab-badge'>{importOrders.length}</span>} */}
          </Tab>
        </TabList>
        <TabPanel>
          {!exportOrders && <div className='loading-bar loading-bar--tab' />}
          {exportOrders &&
            <Table
              className='data-table data-table--striped data-table--interactive data-table--animated'
              columns={[
                {
                  title: `Commodities exported (${exportOrders.length})`,
                  dataIndex: 'name',
                  key: 'name',
                  align: 'left',
                  className: 'max-width-mobile',
                  render: (v, r) =>
                    <>
                      <i className='icon icarus-terminal-cargo' />{v}<br />
                      <div className='is-visible-mobile'>
                        <small style={{ float: 'right' }}>{r.exportOrders.length === 1 ? '1 exporter ' : `${r.exportOrders.length} exporters`}</small>
                      </div>
                      <small>{r.category}</small>
                      {r?.rare === true && <small style={{ opacity: 1 }} className='text-rare'> Rare</small>}
                      <div className='is-visible-mobile'>
                        <table className='two-column-table data-table--compact'>
                          <tbody style={{ textTransform: 'uppercase' }}>
                            <tr>
                              <td><span className='data-table__label'>Total stock</span>{r.totalStock.toLocaleString()} T</td>
                              <td className='text-right'>
                                <span className='data-table__label'>Price</span>
                                {r.avgPrice.toLocaleString()} CR
                                <br />
                                {r.galacticAvgPrice > 0 && r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-negative'>-{(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                                {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-positive'>+{(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <small>{timeBetweenTimestamps(r.updatedAt)} ago</small>
                      </div>
                    </>
                },
                {
                  title: 'Exporters',
                  dataIndex: 'exportOrders',
                  key: 'exportOrders',
                  align: 'center',
                  width: 100,
                  className: 'is-hidden-mobile',
                  render: (v) => <span className='counter counter--table-counter'>{v.length === 1 ? '1' : `${v.length}`}</span>
                },
                {
                  title: 'Updated',
                  dataIndex: 'updatedAt',
                  key: 'updatedAt',
                  align: 'right',
                  width: 150,
                  className: 'is-hidden-mobile no-wrap',
                  render: (v) => <small>{timeBetweenTimestamps(v)}</small>
                },
                {
                  title: 'Total stock',
                  dataIndex: 'totalStock',
                  key: 'totalStock',
                  align: 'right',
                  width: 200,
                  className: 'is-hidden-mobile no-wrap',
                  render: (v) => <>{v.toLocaleString()} T</>
                },
                {
                  title: 'Avg price',
                  dataIndex: 'avgPrice',
                  key: 'avgPrice',
                  align: 'right',
                  width: 150,
                  className: 'is-hidden-mobile no-wrap',
                  render: (v, r) =>
                    <>
                      {v.toLocaleString()} CR
                      <br />
                      {r.galacticAvgPrice > 0 && r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-negative'>-{(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                      {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-positive'>+{(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
                    </>
                }
              ]}
              data={exportOrders}
              rowKey={(r) => `system_exports_${r.systemAddress}_${r.symbol}`}
              emptyText={<span className='muted'>No exported commodities</span>}
              expandable={{
                expandRowByClick: true,
                expandedRowRender: r =>
                  <>
                    <CommodityExportersInSystem
                      system={system}
                      commodityName={r.name}
                      commoditySymbol={r.symbol}
                      commodityOrders={r.exportOrders}
                    />
                    <Collapsible
                      trigger={<CollapsibleTrigger>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                      triggerWhenOpen={<CollapsibleTrigger open>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                    >
                      <CommodityExportersNearby system={system} commodity={r} />
                    </Collapsible>
                    <Collapsible
                      trigger={<CollapsibleTrigger>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                      triggerWhenOpen={<CollapsibleTrigger open>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                    >
                      <CommodityImportersNearby system={system} commodity={r} />
                    </Collapsible>
                    <p className='table-row-expanded-link'>
                      {r?.rare === true &&
                        <div
                          className='button--small'
                          onClick={() => {
                            const rare = rareGoods.filter(rare => rare.name.toLowerCase() === r.name.toLowerCase())?.[0]
                            const contents = rare
                              ? (
                                <>
                                  <p>
                                    {rare.stationName} is the exclusive exporter of {rare.name}.
                                  </p>
                                  <p>
                                    {rare?.description}
                                  </p>
                                  <p>
                                    {rare?.limit && <>Export restrictions limit orders to {rare.limit} T at a time.</>}
                                  </p>
                                </>
                                )
                              : <p>{r.systemName} is the exclusive exporter of {r.name}.</p>

                            setDialog({
                              title: `About ${r.name}`,
                              contents,
                              visible: true
                            })
                          }}
                        >
                          <i className='station-icon icarus-terminal-info' />
                          ABOUT
                        </div>}
                      {r?.rare !== true &&
                        <Link className='button--small' href={`/commodity/${r.symbol}/exporters?location=${encodeURIComponent(r.systemName)}&maxDistance=25`}>
                          <i className='station-icon icarus-terminal-cargo-export' />
                          EXPORTERS
                        </Link>}
                      <Link className='button--small' href={`/commodity/${r.symbol}/importers?location=${encodeURIComponent(r.systemName)}&maxDistance=25`}>
                        <i className='station-icon icarus-terminal-cargo-import' />
                        IMPORTERS
                      </Link>
                    </p>
                  </>
              }}
            />}
        </TabPanel>
        <TabPanel>
          {!importOrders && <div className='loading-bar loading-bar--tab' />}
          {importOrders &&
            <Table
              className='data-table data-table--striped data-table--interactive data-table--animated'
              columns={[
                {
                  title: `Commodities imported (${importOrders.length})`,
                  dataIndex: 'name',
                  key: 'name',
                  align: 'left',
                  className: 'max-width-mobile',
                  render: (v, r) =>
                    <>
                      <i className='icon icarus-terminal-cargo' />{v}<br />
                      <div className='is-visible-mobile'>
                        <small style={{ float: 'right' }}>{r.importOrders.length === 1 ? '1 importer ' : `${r.importOrders.length} importers`}</small>
                      </div>
                      <small>
                        {r.category}
                        {r?.consumer === true && ' (Consumer)'}
                      </small>
                      <div className='is-visible-mobile'>
                        <table className='data-table--compact two-column-table'>
                          <tbody style={{ textTransform: 'uppercase' }}>
                            <tr>
                              <td><span className='data-table__label'>Total demand</span>{r.totalDemand > 0 ? `${r.totalDemand.toLocaleString()} T` : <small>{NO_DEMAND_TEXT}</small>}</td>
                              <td className='text-right'>
                                <span className='data-table__label'>Price</span>
                                {r.avgPrice.toLocaleString()} CR
                                <br />
                                {r.galacticAvgPrice > 0 && r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-positive'>+{(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                                {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-negative'>-{(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <small>{timeBetweenTimestamps(r.updatedAt)} ago</small>
                      </div>
                    </>
                },
                {
                  title: 'Importers',
                  dataIndex: 'importOrders',
                  key: 'importOrders',
                  align: 'center',
                  width: 100,
                  className: 'is-hidden-mobile',
                  render: (v) => <span className='counter counter--table-counter '>{v.length === 1 ? '1' : `${v.length}`}</span>
                },
                {
                  title: 'Updated',
                  dataIndex: 'updatedAt',
                  key: 'updatedAt',
                  align: 'right',
                  width: 150,
                  className: 'is-hidden-mobile no-wrap',
                  render: (v) => <small>{timeBetweenTimestamps(v)}</small>
                },
                {
                  title: 'Total demand',
                  dataIndex: 'totalDemand',
                  key: 'totalDemand',
                  align: 'right',
                  width: 200,
                  className: 'is-hidden-mobile no-wrap',
                  render: (v) => <>{v > 0 ? `${v.toLocaleString()} T` : <small>{NO_DEMAND_TEXT}</small>}</>
                },
                {
                  title: 'Avg price',
                  dataIndex: 'avgPrice',
                  key: 'avgPrice',
                  align: 'right',
                  width: 150,
                  className: 'is-hidden-mobile no-wrap',
                  render: (v, r) =>
                    <>
                      {v.toLocaleString()} CR
                      <br />
                      {r.galacticAvgPrice > 0 && r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-positive'>+{(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                      {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-negative'>-{(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
                    </>
                }
              ]}
              data={importOrders}
              rowKey={(r) => `system_imports_${r.systemAddress}_${r.symbol}`}
              emptyText={<span className='muted'>No imported commodities</span>}
              expandable={{
                expandRowByClick: true,
                expandedRowRender: r =>
                  <>
                    <CommodityImportersInSystem
                      commodityName={r.name}
                      commoditySymbol={r.symbol}
                      commodityOrders={r.importOrders}
                    />
                    <Collapsible
                      trigger={<CollapsibleTrigger>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                      triggerWhenOpen={<CollapsibleTrigger open>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                    >
                      <CommodityExportersNearby commodity={r} />
                    </Collapsible>
                    <Collapsible
                      trigger={<CollapsibleTrigger>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                      triggerWhenOpen={<CollapsibleTrigger open>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                    >
                      <CommodityImportersNearby commodity={r} />
                    </Collapsible>
                    <p className='table-row-expanded-link'>
                      <Link className='button--small' href={`/commodity/${r.symbol}/exporters?location=${encodeURIComponent(r.systemName)}&maxDistance=25`}>
                        <i className='station-icon icarus-terminal-cargo-export' />
                        EXPORTERS
                      </Link>
                      <Link className='button--small' href={`/commodity/${r.symbol}/importers?location=${encodeURIComponent(r.systemName)}&maxDistance=25`}>
                        <i className='station-icon icarus-terminal-cargo-import' />
                        IMPORTERS
                      </Link>
                    </p>
                  </>
              }}
            />}
        </TabPanel>
      </Tabs>
    </div>
  )
}
