import Link from 'next/link'
import Layout from 'components/layout'

export default () =>
  <Layout>
    <h2>404 Not Found</h2>
    <p className='clear'>
      The requested resource could not be found.
    </p>
    <p>
      <Link href='/'>Home</Link>
    </p>
  </Layout>
