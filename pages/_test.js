import Layout from 'components/layout'

export default () =>  (
  <Layout>
    <h2>Test headline</h2>
    <div className='heading--with-underline'>
      <h2>Test headline with underline</h2>
    </div>
    <p>
      Test paragraph
    </p>
    <p>
      Primary theme colour + overdrive
    </p>
    <div>
      {Array.from({ length: 11 }, (_, i) => i).map((number) => (
        <div key={number} style={{height: '3rem', width: '3rem', background: `var(--color-primary-${number})`, display: 'inline-block'}}/>
      ))}
    </div>
    <div>
      {Array.from({ length: 11 }, (_, i) => i).map((number) => (
        <div key={number} style={{filter: 'var(--filter-overdrive)', height: '3rem', width: '3rem', background: `var(--color-primary-${number})`, display: 'inline-block'}}/>
      ))}
    </div>
  </Layout>
)
