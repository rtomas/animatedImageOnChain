import { Inter } from "next/font/google";

import { createPublicClient, http } from 'viem'
import { polygonAmoy } from 'viem/chains'
import { useState, useEffect, use } from "react";

const publicClient = createPublicClient({
    chain: polygonAmoy,
    transport: http()
  })

// import abi from public /json
import gifABI from "../public/abi/AnimatedGif.json";

const inter = Inter({ subsets: ["latin"] });
const FRAMES = 1;

export default function Home() {
    const [isClient, setIsClient] = useState(false);
    const [squares, setSquares] = useState<{ color: string }[][]>([]);
    const [layerColors, setLayerColors] = useState<[]>([]);
    const [actualLayer, setActualLayer] = useState(0);

    
    async function fetchData() {
        const data:any = [];
        for (let i = 0; i < FRAMES; i++) {
            console.log("i ",i ); 
            const layerData = await publicClient.readContract({
                address: '0x1e2850bc23708D04944B1a35F75ACC920c07b72b',
                abi: gifABI.abi as any[],
                functionName: 'getMatrixForLayer',
                args: [i],
              })
            data.push(layerData);
        }

        setLayerColors(data);
    }

    useEffect(() => {
        const data = [];
        for (let i = 0; i < FRAMES; i++) {
            console.log("layerColors[i] ",layerColors[i]);
            if (layerColors[i]) data.push(getColorsForLayer(layerColors[i]));
        }

        setSquares(data);
    }, [layerColors]);

    useEffect(() => {
        fetchData()
    }, []);

    const getColorsForLayer = (colors: number[]) => {
        const squares = [];
        for (let i = 0; i < colors.length; i += 3) {
            const r = colors[i];
            const g = colors[i + 1];
            const b = colors[i + 2];
            squares.push({ color: `rgb(${r}, ${g}, ${b})` });
        }

        return squares;
    };


    useEffect(() => {
        const interval = setInterval(() => {
            setActualLayer((prevActualLayer) =>
                prevActualLayer == FRAMES - 1 ? (prevActualLayer = 0) : prevActualLayer + 1
            );
        }, 600);

        return () => clearInterval(interval);
    }, [squares]);

    useEffect(() => {
        console.log(actualLayer);
    }, [actualLayer]);

    return (
        <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
            <div className="grid grid-cols-32 gap-0 border-solid-white" style={{ width: "160px", height: "160px" }}>
                {squares[actualLayer] &&
                    squares[actualLayer].map((square, index) => (
                        <div key={index} style={{ backgroundColor: square.color, width: "5px", height: "5px" }} />
                    ))}
            </div>

            <div className="flex flex-col items-center justify-center">
                <div>
                    Layer: {actualLayer + 1} / {layerColors.length}
                </div>
                <div>
                    Polygon Amoy:{" "}
                    <a
                        href="https://www.oklink.com/amoy/address/0x1e2850bc23708D04944B1a35F75ACC920c07b72b/contract"
                        target="_blank"
                    >
                        0x1e2850bc23708D04944B1a35F75ACC920c07b72b
                    </a>
                </div>
                <div>
                    <a href="https://github.com/rtomas/animatedImageOnChain-SC" target="_blank">
                        Smart contract Hardhat Github
                    </a>
                </div>
                <div>
                    <a href="https://github.com/rtomas/animatedImageOnChain-UI" target="_blank">
                        Next.js + viem UI Github
                    </a>
                </div>
            </div>
        </main>
    );
}
