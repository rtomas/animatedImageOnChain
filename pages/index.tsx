import { Inter } from "next/font/google";

import { useContractRead, readContracts } from "wagmi";
import { useState, useEffect } from "react";

// import abi from public /json
import gifABI from "../public/abi/AnimatedGif.json";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
    const [isClient, setIsClient] = useState(false);
    const [squares, setSquares] = useState<{ color: string }[][]>([]);
    const [layerColors, setLayerColors] = useState<{ result?: number[]; status: string }[]>([]);
    const [actualLayer, setActualLayer] = useState(0);

    useEffect(() => {
        setIsClient(true);

        async function fetchData() {
            /* const squares1 = await getColorsForLayer2(0);
            const squares2 = await getColorsForLayer2(1); */
            //setSquares1(squares1);
            //setSquares2(squares2);
            const data = await readAllLayersFromContract();
            console.log(data);
            setLayerColors(data);
        }

        fetchData();
    }, []);

    useEffect(() => {
        const data = [];
        if (layerColors[0]?.result !== undefined) data.push(getColorsForLayer(layerColors[0].result));
        if (layerColors[1]?.result) data.push(getColorsForLayer(layerColors[1].result));
        if (layerColors[2]?.result) data.push(getColorsForLayer(layerColors[2].result));
        console.log(data);
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

    async function readAllLayersFromContract() {
        const data = await readContracts({
            contracts: [
                {
                    address: "0x13FB0eafB42243998933E24b27fD7e4af2D9e107",
                    abi: gifABI.abi as any[],
                    functionName: "getMatrixForLayer",
                    args: [0],
                },
                {
                    address: "0x13FB0eafB42243998933E24b27fD7e4af2D9e107",
                    abi: gifABI.abi as any[],
                    functionName: "getMatrixForLayer",
                    args: [1],
                },
                {
                    address: "0x13FB0eafB42243998933E24b27fD7e4af2D9e107",
                    abi: gifABI.abi as any[],
                    functionName: "getMatrixForLayer",
                    args: [2],
                },
            ],
        });
        return data;
    }

    useEffect(() => {
        const actualLayer = 0;
        const interval = setInterval(() => {
            setActualLayer((prevActualLayer) => (prevActualLayer == 2 ? (prevActualLayer = 0) : prevActualLayer + 1));
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <main className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}>
            <div className="grid grid-cols-32 gap-0 border-solid-white" style={{ width: "800px", height: "800px" }}>
                {squares[actualLayer] &&
                    squares[actualLayer].map((square, index) => (
                        <div key={index} style={{ backgroundColor: square.color, width: "25px", height: "25px" }} />
                    ))}
            </div>
        </main>
    );
}
