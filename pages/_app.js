import "../styles/app.sass";

import { CreateLendProvider } from "../context/LendContext";

import { publicProvider } from "wagmi/providers/public";
import { WagmiConfig, createConfig, configureChains } from "wagmi";

// import { filecoinHyperspace, mainnet } from "@wagmi/core/chains";
import { sepolia, xdcTestnet } from "wagmi/chains";
import { alchemyProvider } from "@wagmi/core/providers/alchemy";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

import { MetaMaskConnector } from "wagmi/connectors/metaMask";
// import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet";
// import { WalletConnectConnector } from "wagmi/connectors/walletConnect";
// import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import {
  ConnectKitProvider,
  ConnectKitButton,
  getDefaultClient,
} from "connectkit";
import { useEffect } from "react";

const { chains, provider, publicClient, webSocketPublicClient } =
  configureChains(
    [xdcTestnet],
    [
      jsonRpcProvider({
        rpc: (chain) => ({
          http: `https://rpc.apothem.network`,
        }),
      }),
    ]
  );

const config = createConfig({
  autoConnect: true,
  connectors: [new MetaMaskConnector({ chains })],
  publicClient,
  webSocketPublicClient,
});

// const client = createClient({
//   autoConnect: true,
//   connectors: [
//     new MetaMaskConnector({ chains }),
//     new CoinbaseWalletConnector({
//       chains,
//       options: {
//         appName: "NftLend",
//       },
//     }),
//     new WalletConnectConnector({
//       chains,
//       options: {
//         qrcode: true,
//       },
//     }),
//   ],
//   provider,
// });

export default function App({ Component, pageProps }) {
  return (
    <CreateLendProvider>
      <WagmiConfig config={config}>
        <ConnectKitProvider>
          <Component {...pageProps} />
        </ConnectKitProvider>
      </WagmiConfig>
    </CreateLendProvider>
  );
}
