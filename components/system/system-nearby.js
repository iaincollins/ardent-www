import { useRouter } from 'next/router'
import Table from 'rc-table'
import SystemObjectIcon from 'components/system-object-icon'

module.exports = ({ nearbySystems }) => {
  const router = useRouter()

  const onSystemsRowClick = (record, index, event) => {
    router.push(`/system/${record.systemAddress}`)
  }

  return (
    <div className='fx__fade-in'>
      <div className='heading--with-underline'>
        <h2>Nearest Systems</h2>
      </div>
      <Table
        className='data-table data-table--striped data-table--interactive data-table--animated'
        columns={[
          {
            title: 'Nearby systems',
            dataIndex: 'systemName',
            key: 'systemName',
            align: 'left',
            render: (v, r) =>
              <SystemObjectIcon type='Star'>
                {v}
                <small className='is-visible-mobile text-no-transform'> {r?.distance < 1 ? '< 1 ly' : <>{Math.floor(r.distance).toLocaleString()} ly</>}</small>
              </SystemObjectIcon>
          },
          {
            title: 'Distance',
            dataIndex: 'distance',
            key: 'distance',
            align: 'right',
            className: 'no-wrap is-hidden-mobile',
            render: (v) => v < 1
              ? '< 1 ly'
              : <span class='text-primary'>{Math.floor(v).toLocaleString()} ly</span>
          }
        ]}
        data={nearbySystems}
        emptyText={(nearbySystems === undefined || nearbySystems === null) ? <span className='muted'>Searching...</span> : <span className='muted'>No nearby systems known</span>}
        rowKey='systemAddress'
        onRow={(record, index) => ({
          onClick: onSystemsRowClick.bind(null, record, index)
        })}
      />
    </div>
  )
}
