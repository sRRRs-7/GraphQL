import { ChakraProvider } from '@chakra-ui/react'
import theme from '../theme'
import { AppProps } from 'next/app'
import { RecoilRoot } from 'recoil'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </RecoilRoot>

  )
}

export default MyApp
