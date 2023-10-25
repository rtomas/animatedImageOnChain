import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiConfig, configureChains, createConfig } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { InjectedConnector } from "wagmi/connectors/injected";
import { publicProvider } from "wagmi/providers/public";

const { chains, publicClient } = configureChains([polygonMumbai], [publicProvider()]);

const config = createConfig({
    autoConnect: true,
    connectors: [new InjectedConnector({ chains })],
    publicClient,
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <WagmiConfig config={config}>
            <Component {...pageProps} />
        </WagmiConfig>
    );
}
