// Pages Router
 
// This file allows you to customize the <html> and <body> tags
// for the server request, but adds framework-specific features
// rather than writing HTML elements.
import { Html, Head, Main, NextScript } from 'next/document';
 
function Document() {
  return (
    <Html>
      <Head />
      <body className='h-full pt-[34.5px]' style={{background: '#030303'}}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

export default Document;