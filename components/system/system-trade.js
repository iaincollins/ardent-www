import Link from 'next/link'
import { useRouter } from 'next/router'
import Collapsible from 'react-collapsible'
import { CollapsibleTrigger } from 'components/collapsible-trigger'
import { timeBetweenTimestamps } from 'lib/utils/dates'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import Table from 'rc-table'
import LocalCommodityImporters from 'components/local-commodity-importers'
import LocalCommodityExporters from 'components/local-commodity-exporters'
import NearbyCommodityImporters from 'components/nearby-commodity-importers'
import NearbyCommodityExporters from 'components/nearby-commodity-exporters'

import { NO_DEMAND_TEXT } from 'lib/consts'

module.exports = ({
  system,
  importOrders,
  exportOrders,
  rareGoods,
  lastUpdatedAt
}) => {
  const router = useRouter()

  return (
    <div className='fx__fade-in'>
      <div className='heading--with-underline'>
        <h2>Commodities</h2>
      </div>
      <p className='muted'>{system.systemName} trade data last updated {timeBetweenTimestamps(lastUpdatedAt)} ago</p>
      {rareGoods?.length > 0 &&
        <div style={{ marginBottom: '1rem' }}>
          {rareGoods.map(rare =>
            <Collapsible
              key={`rare_good_${rare.symbol}`}
              trigger={<p style={{ margin: '.25rem 0', display: 'inline-block' }}><CollapsibleTrigger>Rare Export — {rare.name}</CollapsibleTrigger></p>}
              triggerWhenOpen={<p style={{ margin: '.25rem 0', display: 'inline-block' }}><CollapsibleTrigger open>Rare Export — {rare.name}</CollapsibleTrigger></p>}
            >
              <div style={{ padding: '0 1rem', opacity: 0.7 }}>
                <p>
                  {rare.stationName} is the exclusive exporter of {rare.name}.
                </p>
                <p>
                  {rare?.description}
                </p>
                <p>
                  {rare?.limit && <>Export restrictions limit orders to {rare.limit} T at a time.</>}
                </p>
              </div>
            </Collapsible>
          )}
        </div>}
      <Tabs
        onSelect={
          (index) => {
            const view = (index === 1) ? 'imports' : 'exports'
            router.push(`/system/${system.systemName.replaceAll(' ', '_')}/${view}`)
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
          {!exportOrders && <div style={{ marginTop: '2rem' }} className='loading-bar loading-bar--tab' />}
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
                      <small>
                        {r.category}
                        {r?.rare === true && ', Rare'}
                        {r?.producer === true && ' (Producer)'}
                      </small>
                      <div className='is-visible-mobile'>
                        <table className='data-table--mini two-column-table data-table--compact'>
                          <tbody style={{ textTransform: 'uppercase' }}>
                            <tr>
                              <td><span className='data-table__label'>Total stock</span>{r.totalStock.toLocaleString()} T</td>
                              <td className='text-right'>
                                <span className='data-table__label'>Price</span>
                                {r.avgPrice.toLocaleString()} CR
                                <br />
                                {r.galacticAvgPrice > 0 && r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-negative'>- {(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                                {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-positive'>+ {(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <small style={{ textTransform: 'none' }}>{timeBetweenTimestamps(r.updatedAt)} ago</small>
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
                  render: (v) => <span className='muted'>{v.length === 1 ? '1 ' : `${v.length}`}<i style={{ fontSize: '1.25rem', position: 'relative', top: '-.2rem', marginLeft: '.4rem' }} className='icarus-terminal-settlement muted' /></span>
                },
                {
                  title: 'Updated',
                  dataIndex: 'updatedAt',
                  key: 'updatedAt',
                  align: 'right',
                  width: 150,
                  className: 'is-hidden-mobile no-wrap',
                  render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)}</span>
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
                      {r.galacticAvgPrice > 0 && r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-negative'>- {(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                      {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-positive'>+ {(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
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
                    <p style={{ marginTop: '.5rem' }}>
                      Stock of <Link href={`/commodity/${r.symbol}/exporters?location=${encodeURIComponent(r.systemName)}&maxDistance=100`}>{r.name}</Link> in {r.systemName}
                    </p>
                    <LocalCommodityExporters
                      system={system}
                      commodityName={r.name}
                      commoditySymbol={r.symbol}
                      commodityOrders={r.exportOrders}
                    />
                    <Collapsible
                      trigger={<CollapsibleTrigger>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                      triggerWhenOpen={<CollapsibleTrigger open>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                    >
                      <NearbyCommodityExporters system={system} commodity={r} />
                    </Collapsible>
                    <Collapsible
                      trigger={<CollapsibleTrigger>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                      triggerWhenOpen={<CollapsibleTrigger open>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                    >
                      <NearbyCommodityImporters system={system} commodity={r} />
                    </Collapsible>
                  </>
              }}
            />}
        </TabPanel>
        <TabPanel>
          {!importOrders && <div style={{ marginTop: '2rem' }} className='loading-bar loading-bar--tab' />}
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
                        <table className='data-table--mini data-table--compact two-column-table'>
                          <tbody style={{ textTransform: 'uppercase' }}>
                            <tr>
                              <td><span className='data-table__label'>Total demand</span>{r.totalDemand > 0 ? `${r.totalDemand.toLocaleString()} T` : <small>{NO_DEMAND_TEXT}</small>}</td>
                              <td className='text-right'>
                                <span className='data-table__label'>Price</span>
                                {r.avgPrice.toLocaleString()} CR
                                <br />
                                {r.galacticAvgPrice > 0 && r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-positive'>+ {(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                                {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-negative'>- {(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                        <small style={{ textTransform: 'none' }}>{timeBetweenTimestamps(r.updatedAt)} ago</small>
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
                  render: (v) => <span className='muted'>{v.length === 1 ? '1 ' : `${v.length}`}<i style={{ fontSize: '1.25rem', position: 'relative', top: '-.2rem', marginLeft: '.4rem' }} className='icarus-terminal-settlement muted' /></span>
                },
                {
                  title: 'Updated',
                  dataIndex: 'updatedAt',
                  key: 'updatedAt',
                  align: 'right',
                  width: 150,
                  className: 'is-hidden-mobile no-wrap',
                  render: (v) => <span style={{ opacity: 0.5 }}>{timeBetweenTimestamps(v)}</span>
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
                      {r.galacticAvgPrice > 0 && r.avgPrice > r.galacticAvgPrice && <small className='commodity__price text-positive'>+ {(r.avgPrice - r.galacticAvgPrice).toLocaleString()} CR</small>}
                      {r.avgPrice < r.galacticAvgPrice && <small className='commodity__price text-negative'>- {(r.galacticAvgPrice - r.avgPrice).toLocaleString()} CR</small>}
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
                    <p style={{ marginTop: '.5rem' }}>
                      Demand for <Link href={`/commodity/${r.symbol}/importers?location=${encodeURIComponent(r.systemName)}&maxDistance=100`}>{r.name}</Link> in {r.systemName}
                    </p>
                    <LocalCommodityImporters
                      commodityName={r.name}
                      commoditySymbol={r.symbol}
                      commodityOrders={r.importOrders}
                    />
                    <Collapsible
                      trigger={<CollapsibleTrigger>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                      triggerWhenOpen={<CollapsibleTrigger open>Stock of <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                    >
                      <NearbyCommodityExporters commodity={r} />
                    </Collapsible>
                    <Collapsible
                      trigger={<CollapsibleTrigger>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                      triggerWhenOpen={<CollapsibleTrigger open>Demand for <strong>{r.name}</strong> near <strong>{r.systemName}</strong></CollapsibleTrigger>}
                    >
                      <NearbyCommodityImporters commodity={r} />
                    </Collapsible>
                  </>
              }}
            />}
        </TabPanel>
      </Tabs>
    </div>
  )
}
