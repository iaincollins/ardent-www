import Document, { Html, Head, Main, NextScript } from 'next/document'

// Disable onContextMenu so we can replace with custom behaviour
// const onContextMenu = process.env.NODE_ENV === 'development'
//   ? ''
//   : 'document.oncontextmenu = (e) => e.preventDefault()'
const onContextMenu = ''

class MyDocument extends Document {
  static async getInitialProps (ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render () {
    return (
      <Html lang='en'>
        <Head>
          <meta name='theme-color' content='#000' />
          <style dangerouslySetInnerHTML={{
            __html: 'html,body{background:#000;}'
          }}
          />
          <script dangerouslySetInnerHTML={{ __html: onContextMenu }} />
          <noscript>
            <style dangerouslySetInnerHTML={{
              __html: `
table.data-table--animated > tbody > tr:not(.rc-table-expanded-row),
.data-table--animated > .rc-table-container > .rc-table-content > table > tbody > tr:not(.rc-table-expanded-row) {
  opacity: 1 !important;
}
            `.trim()
            }}
            />
          </noscript>
        </Head>
        <body>
          <div dangerouslySetInnerHTML={{
            __html: `
<script>
  const isChromium = window.chrome
  const isOpera = typeof window.opr !== "undefined"
  const isIEedge = window.navigator.userAgent.indexOf('Edg') > -1
  const isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1
  const isIOSChrome = window.navigator.userAgent.match('CriOS')
  const isIOSFirefox = window.navigator.userAgent.match('FxiOS')
  const isSafari = navigator.vendor.match(/apple/i) 
    && !isIOSChrome && !isIOSFirefox
    && !navigator.userAgent.match(/Opera|OPT\\//)

 if (isSafari) document.documentElement.setAttribute("data-browser", "safari")
 if (isFirefox) document.documentElement.setAttribute("data-browser", "firefox")

 try {
  const themeSettings = JSON.parse(window.localStorage.getItem('theme-settings'))
  if (themeSettings) {
    document.documentElement.style.setProperty('--color-primary-hue', themeSettings.hue)
    document.documentElement.style.setProperty('--color-primary-saturation', \`\${themeSettings.saturation}%\`)
  }
} catch (e) {}
</script>
          `.trim()
          }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
