import { useRouter } from 'next/router'
import Table from 'rc-table'

module.exports = ({ nearbySystems }) => {
  const router = useRouter()

  const onSystemsRowClick = (record, index, event) => {
    router.push(`/system/${record.systemName.replaceAll(' ', '_')}`)
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
            title: 'System Name',
            dataIndex: 'systemName',
            key: 'systemName',
            align: 'left',
            render: (v) => <><i className='icon icarus-terminal-star' />{v}</>
          },
          {
            title: 'Distance',
            dataIndex: 'distance',
            key: 'distance',
            align: 'right',
            className: 'no-wrap',
            render: (v) => v < 1
              ? '< 1 ly'
              : <>{Math.floor(v).toLocaleString()} ly</>
          }
        ]}
        data={nearbySystems}
        rowKey='systemAddress'
        onRow={(record, index) => ({
          onClick: onSystemsRowClick.bind(null, record, index)
        })}
      />
    </div>
  )
}
