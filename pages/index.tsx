import { Inter } from "next/font/google";

import { useContractRead, readContracts } from "wagmi";
import { useState, useEffect, use } from "react";

// import abi from public /json
import gifABI from "../public/abi/AnimatedGif.json";

const inter = Inter({ subsets: ["latin"] });
const FRAMES = 4;

export default function Home() {
    const [isClient, setIsClient] = useState(false);
    const [squares, setSquares] = useState<{ color: string }[][]>([]);
    const [layerColors, setLayerColors] = useState<{ result?: number[]; status: string }[]>([]);
    const [actualLayer, setActualLayer] = useState(0);

    useEffect(() => {
        setIsClient(true);

        async function fetchData() {
            const data = [];
            for (let i = 0; i < FRAMES; i++) {
                data.push(await readAllLayersFromContract(i));
            }

            console.log(data);
            setLayerColors(data);
        }

        fetchData();
    }, []);

    useEffect(() => {
        const data = [];
        for (let i = 0; i < FRAMES; i++) {
            if (layerColors[i]?.result !== undefined) data.push(getColorsForLayer(layerColors[i].result || []));
        }

        setSquares(data);
    }, [layerColors]);

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

    async function readAllLayersFromContract(layer: number) {
        const data = await readContracts({
            contracts: [
                {
                    address: "0x4226E81E6f94890465052FB750671C3cE52302a7",
                    abi: gifABI.abi as any[],
                    functionName: "getMatrixForLayer",
                    args: [layer],
                },
            ],
        });
        return data[0];
    }

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
                    Layer: {actualLayer + 1} / {layerColors.length + 1}
                </div>
                <div>
                    Polygon mumbai:{" "}
                    <a
                        href="https://mumbai.polygonscan.com/address/0x4226E81E6f94890465052FB750671C3cE52302a7"
                        target="_blank"
                    >
                        0x4226E81E6f94890465052FB750671C3cE52302a7
                    </a>
                </div>
                <div>
                    <a href="https://github.com/rtomas/animatedImageOnChain-SC" target="_blank">
                        Smart contract Hardhat Github
                    </a>
                </div>
                <div>
                    <a href="https://github.com/rtomas/animatedImageOnChain-UI" target="_blank">
                        Next.js + wagmi UI Github
                    </a>
                </div>
            </div>
        </main>
    );
}
