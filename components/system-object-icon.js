module.exports = ({ systemObjectType, systemObject, children }) => {
  let icon = 'planet'

  const _systemObjectType = systemObjectType ?? systemObject?.bodyType

  if (_systemObjectType === 'Star') {
    icon = 'star'
  } else if (_systemObjectType === 'Planet') {    

    if (systemObject.rings)
      icon = 'planet-ringed'

    if (systemObject.atmosphereComposition && !systemObject?.subType?.toLowerCase()?.includes('gas giant'))
      icon = 'planet-atmosphere'

    if (systemObject?.subType?.toLowerCase() === 'high metal content world' || systemObject?.subType?.toLowerCase() === 'metal rich')
      icon = 'planet-high-metal-content'

    if (systemObject?.subType?.toLowerCase() === 'ammonia world')
      icon = 'planet-ammonia-world'

    if (systemObject?.subType?.toLowerCase()?.includes('water world') || systemObject?.subType?.toLowerCase()?.includes('water giant')) 
      icon = 'planet-water-world'

    if (systemObject.atmosphereComposition && !systemObject?.subType?.toLowerCase()?.includes('gas giant'))
      icon = 'planet-atmosphere'

    if (systemObject?.subType?.toLowerCase()?.includes('gas giant'))
        icon = 'planet-gas-giant'    

    /*
    if (systemObject?.subType?.toLowerCase()?.includes('water-based life'))
      icon = 'planet-water-based-life'

    if (systemObject?.subType?.toLowerCase()?.includes('ammonia-based life'))
      icon = 'planet-ammonia-based-life'

    */

    if (systemObject?.subType?.toLowerCase() === 'earth-like world')
      icon = 'planet-earthlike'

    if (systemObject.terraformingState && systemObject.terraformingState !== 'Not terraformable' && systemObject.terraformingState !== 'Terraformed')
        icon = 'planet-terraformable'


    if (systemObject?.isLandable) {
      if (systemObject?.atmosphereComposition && !systemObject?.subType?.toLowerCase()?.includes('gas giant')) {
        icon = 'planet-atmosphere-landable'
      } else {
        icon = 'planet-landable'
      }
    }
  }

  if (children) {
    return (
      <span style={{ position: 'relative', paddingLeft: '2rem', display: 'inline-block' }}>
        <i style={{ position: 'absolute', left: 0, top: '.1rem' }} className={`system-object-icon icarus-terminal-${icon}${systemObject?.isLandable ? ' text-info' : ''}`} />
        {children}
      </span>
    )
  } else {
    return <i className={`system-object-icon icarus-terminal-${icon}`} />
  }
}
