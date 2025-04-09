# Ardent Website

This is the website for [ardent-insight.com](https://ardent-insight.com)

Ardent provides trade and exploration data for the game 
[Elite Dangerous](https://www.elitedangerous.com/).

It uses a live data feed from the 
[Elite: Dangerous Data Network](https://eddn.edcd.io) by the 
[Elite: Dangerous Community Developers](https://edcd.github.io/).

Related repositories:

* https://github.com/iaincollins/ardent-api
* https://github.com/iaincollins/ardent-collector
* https://github.com/iaincollins/ardent-auth

## Getting started

### Starting in production mode

Dependencies are installed and the site run in production mode in the usual 
way for a Node.js application with a build step:

    npm install
    npm run build
    npm run start

It is a good idea to test all builds in production mode after being in 
development mode as there can be some differences in behaviour, in particular 
relating to how CSS behaves after assets are build for production.

### Starting in development mode

Dependencies are installed and the site run in development mode in the usual 
way for a Node.js application:

    npm install
    npm run dev

This will start a web server running on port `3000` in development mode with 
hot reloading enabled, the site will connect to the live API. This is useful 
for testing with real world data without needing to have a full  copy of the 
databsases locally, but is limited as sign in will not work in this mode.

Note: You may sometimes see CORS requests failing locally in the browser as a 
side effect of running the site on localhost while making calls to the 
production API URL. These errors can be safely ignored.

### Starting the full stack in development mode

You can run the full stack with 
[ardent-www](https://github.com/iaincollins/ardent-www), 
[ardent-api](https://github.com/iaincollins/ardent-api) and
[ardent-auth](https://github.com/iaincollins/ardent-auth) locally by starting 
all of them using `npm run dev:local` which will start each service running on 
port `3000`, `3001` and `3003` respectively. You can optionally also run the 
[ardent-collector](https://github.com/iaincollins/ardent-collector) using 
`npm run dev`, port `3002` is reserved for the collector although it does not 
have a public facing interface.

Being able to run the full stack locally, including authentication, requires 
configuration of appropriate auth tokens using environment variables or an 
`ardent.config` file.

You will, at a mimium, need to configure the following details, with the 
`AUTH_CLIENT_ID` option corresponding to the Client ID you can configured 
on the Frontier Development developer portal.

    AUTH_CLIENT_ID=
    ARDENT_AUTH_JWT_SECRET=
    ARDENT_SESSION_SECRET=

Tip: If you create a file called `ardent.config` in the parent directory for 
the repositories - or create a file at `/etc/ardent.config` - with environment 
variables in this format all the services will use any supported configuration 
options specified there.

## Credits

_This software would not be possible without work from dozens of enthusiasts 
and hundreds of open source contributors._

Special thanks to Elite Dangerous Community Developers members, Elite 
Dangerous Data Network maintainers, Anthor (Elite Dangerous Star Map) 
and Gareth Harper (Spansh).

Thank you to all those who have created and supported libraries on which this 
software depends and to Frontier Developments plc for supporting third party 
tools.

## Legal

Copyright Iain Collins, 2024.

This software has been released under the GNU Affero General Public License.

Elite Dangerous is copyright Frontier Developments plc. This software is 
not endorsed by nor reflects the views or opinions of Frontier Developments and 
no employee of Frontier Developments was involved in the making of it.