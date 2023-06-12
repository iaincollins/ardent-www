# ardent-spike

## API Endpoints

### Statistics

Get statistics for the current databases (updated hourly).

* https://api.ardent-industry.com/v1/stats

    Ardent Collector v1.28.0 Online
    --------------------------
    Star systems: 102,563,852
    Trade systems: 14,854
    Trade stations: 35,096
    Trade carriers: 4,533
    Commodities updated in last 24 hours: 699,561
    Commodities updated in last 7 days: 2,796,577
    Commodities updated in last 30 days: 7,766,588
    Total buy/sell orders: 8,673,087 (385 unique)

### Commodity Reports

Includes analysis and specific trade reports for systems in and around the Core Systems (aka The Bubble) and the Colonia region. Excludes market data from Fleet Carriers. Reports updated hourly.

* https://api.ardent-industry.com/v1/commodities
* https://api.ardent-industry.com/v1/commodities/core-systems-1000
* https://api.ardent-industry.com/v1/commodities/colonia-systems-1000

### Commodity API

Galactic data for all known commodiites. Alllows filtering by for importers and exporters, by demand/stock, buy/sell price and can include, exclude or exclusively show data for Fleet Carriers. Data updated in real time, by information via API may be delayed for up to 5 minutes due to cache policy.

* https://api.ardent-industry.com/v1/commodity/name/gold
* https://api.ardent-industry.com/v1/commodity/name/gold/importers
* https://api.ardent-industry.com/v1/commodity/name/gold/exporters

The `importers` and `exporters` endpoints support the following query parameters:

 * fleetCarriers (bool); default null
 * minPrice (int); default 1
 * minVolume (int); default 1

e.g.
  https://api.ardent-industry.com/v1/commodity/name/gold/importers?fleetCarriers=false&minPrice=100&minVolume=100

### System API

Get information about a system, including it's location, nearby systems and commodities traded in (or nearby) as system. Data updated in real time, by information via API may be delayed for up to 5 minutes due to cache policy.

* https://api.ardent-industry.com/v1/system/name/Sol
* https://api.ardent-industry.com/v1/system/name/Sol/nearest
* https://api.ardent-industry.com/v1/system/name/Sol/commodities
* https://api.ardent-industry.com/v1/system/name/Sol/commodities/imports
* https://api.ardent-industry.com/v1/system/name/Sol/commodities/exports
* https://api.ardent-industry.com/v1/system/name/Sol/commodity/name/gold/nearest/importers
* https://api.ardent-industry.com/v1/system/name/Sol/commodity/name/gold/nearest/exporters

The `commodities/imports` and `commodities/exports` endpoints support the following query parameters:

 * fleetCarriers (bool); default null
 * minPrice (int); default 1
 * minVolume (int); default 1

e.g.
  https://api.ardent-industry.com/v1/system/name/Sol/commodities/imports?fleetCarriers=false&minPrice=100&minVolume=100

The `nearest/importers` and `commodities/exporters` endpoints support the the same query parameters, with addition of `maxDistance` option (value in Ly from specificed system).

 * maxDistance (int); default 100, max 500

e.g.
  https://api.ardent-industry.com/v1/system/name/Sol/commodity/name/gold/nearest/importers?fleetCarriers=false&minPrice=100&minVolume=100&maxDistance=100

  Ce