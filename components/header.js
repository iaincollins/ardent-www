import Package from '../package.json'

export default () =>
  <div className='logo'>
    <h1>
      Ardent Industry
    </h1>
    <p>
      Trade and Exploration Data
    </p>
    <br/>
    <small><a style={{ textDecoration: 'none'}} href="https://github.com/iaincollins/ardent-www">v{Package.version} (BETA)</a></small>
  </div>
