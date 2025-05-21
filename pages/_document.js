import Document, { Html, Head, Main, NextScript } from 'next/document'
import { getSettings } from '../lib/settings-server'

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    try {
      const initialProps = await Document.getInitialProps(ctx)
      const settings = await getSettings()
      return { ...initialProps, settings }
    } catch (error) {
      console.error('Error in _document.js:', error)
      const initialProps = await Document.getInitialProps(ctx)
      return { ...initialProps, settings: {} }
    }
  }

  render() {
    const { settings = {} } = this.props
    return (
      <Html lang="en">
        <Head>
          {/* Analytics Integration */}
          {settings?.ga4Id && (
            <>
              <script async src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga4Id}`} />
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${settings.ga4Id}');
                  `,
                }}
              />
            </>
          )}
          {settings?.adsenseId && (
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsenseId}`}
              crossOrigin="anonymous"
            />
          )}

          {/* Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

          {/* Enhanced SEO Meta Tags */}
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
          <meta name="googlebot" content="index, follow" />
          <meta name="bingbot" content="index, follow" />
          <meta name="msnbot" content="index, follow" />

          {/* Bing Specific Meta Tags */}
          <meta name="msvalidate.01" content={settings?.bingVerificationId || ''} />

          {/* Language and Region */}
          <link rel="alternate" href={settings?.siteUrl} hrefLang="x-default" />
          <link rel="alternate" href={settings?.siteUrl} hrefLang="en" />

          {/* OpenGraph Basic */}
          <meta property="og:locale" content="en_US" />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content={settings?.siteName || 'My CMS'} />

          {/* Custom Head Code */}
          {settings?.customHeadCode && (
            <div
              dangerouslySetInnerHTML={{
                __html: settings.customHeadCode,
              }}
            />
          )}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument

