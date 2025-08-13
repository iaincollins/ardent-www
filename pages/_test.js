import Layout from 'components/layout'

export default () => (
  <Layout>
    <div className='heading--with-underline'>
      <h2>Theme preview</h2>
    </div>
    <p>
      Primary theme colour
    </p>
    <div>
      {Array.from({ length: 11 }, (_, i) => i).map((number) => (
        <div key={number} style={{ height: '3rem', width: '3rem', background: `var(--color-primary-${number})`, display: 'inline-block' }}>
          {number}
        </div>
      ))}
    </div>
    <div>
      {Array.from({ length: 11 }, (_, i) => i).map((number) => (
        <div key={number} style={{ filter: 'var(--filter-overdrive)', height: '3rem', width: '3rem', background: `var(--color-primary-${number})`, display: 'inline-block' }}>
          {number}
        </div>
      ))}
    </div>
    <p>
      Highlight colour
    </p>
    <div>
      {Array.from({ length: 11 }, (_, i) => i).map((number) => (
        <div key={number} style={{ height: '3rem', width: '3rem', background: `var(--color-highlight-${number})`, display: 'inline-block' }}>
          {number}
        </div>
      ))}
    </div>
    <div>
      {Array.from({ length: 11 }, (_, i) => i).map((number) => (
        <div key={number} style={{ filter: 'var(--filter-overdrive)', height: '3rem', width: '3rem', background: `var(--color-highlight-${number})`, display: 'inline-block' }}>
          {number}
        </div>
      ))}
    </div>
  </Layout>
)
