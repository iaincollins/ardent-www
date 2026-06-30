import Layout from 'components/layout'

export default () => {
  return (
    <Layout>
      <div className='fx__fade-in'>
        <h2>
          Authentication error
        </h2>
        <p className='clear'>
          An error occured during authentication.
        </p>
        <p>
          Sign in may fail if the Elite Dangerous servers are down for updates or maintenance. 
        </p>
        <p>
          Check the <a href='https://forums.frontier.co.uk/forums/frontier-news-and-announcements/' target='_blank' rel='noopener noreferrer'>
             Elite Dangerous Forum
          </a> for status announcements.
        </p>
        <p>
          <a href="/">Return to main page</a>
        </p>
      </div>
    </Layout>
  )
}
