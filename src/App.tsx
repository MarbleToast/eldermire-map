import React, { useEffect, useState } from "react";
import Canvas from "./Canvas";
import Map from "./Map.js";
import HeightMap from "./HeightMap.js";
import questsData from "./quests";

import "./App.css";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { renderToStaticMarkup } from "react-dom/server";

export type HexagonData = {
    id: number;
    path: Path2D;
    shade: number;
    wind: number;
    location?: string;
    encounter?: string;
};

export type QuestData = {
    id: number;
    giver: string;
    details: string;
    reward: string;
};

const App: React.FunctionComponent = () => {
    const svgStrings = [
        encodeURIComponent(renderToStaticMarkup(<Map />)),
        encodeURIComponent(renderToStaticMarkup(<HeightMap />)),
        "none",
    ];

    const [backgroundId, setBackgroundId] = useState(0);

    const [hexs, setHexs] = useState<HexagonData[]>([]);
    const [quests, setQuests] = useState<QuestData[]>(
        JSON.parse(localStorage.getItem("quests") || JSON.stringify(questsData))
    );
    const [currentSelected, setCurrentSelected] = useState<number | null>(null);
    const [currentHovered, setCurrentHovered] = useState<number | null>(null);
    const [currentWatch, setCurrentWatch] = useState(0);
    const [currentSideTab, setCurrentSideTab] = useState(0);
    const [showGrid, setShowGrid] = useState(true);
    const [showLocations, setShowLocations] = useState(true);
    const [showRain, setShowRain] = useState(true);
    const [showZones, setShowZones] = useState(true);
    const [cursorPos, setCursorPos] = useState<[number, number] | null>(null);

    const selectedHex = currentSelected && hexs[currentSelected];
    const hoveredHex = currentHovered && hexs[currentHovered];

    useEffect(() => {
        localStorage.setItem("quests", JSON.stringify(quests));
    }, [quests]);

    return (
        <div style={{ display: "flex" }}>
            <div
                style={{
                    height: "100vh",
                    flex: 1,
                    position: "relative",
                }}
            >
                <TransformWrapper
                    initialScale={1}
                    limitToBounds={false}
                    pinch={{ disabled: true }}
                    zoomAnimation={{ disabled: false }}
                    wheel={{ step: 10 }}
                    doubleClick={{ disabled: true }}
                    panning={{ excluded: ["textarea"] }}
                >
                    <TransformComponent wrapperStyle={{ height: "100%" }}>
                        <Canvas
                            setCursorPos={setCursorPos}
                            showGrid={showGrid}
                            showLocations={showLocations}
                            showRain={showRain}
                            showZones={showZones}
                            hexs={hexs}
                            setHexs={setHexs}
                            currentWatch={currentWatch}
                            currentHovered={currentHovered}
                            currentSelected={currentSelected}
                            setCurrentSelected={setCurrentSelected}
                            setCurrentHovered={setCurrentHovered}
                            backgroundAsString={svgStrings[backgroundId]}
                        />
                    </TransformComponent>

                    <div
                        style={{
                            position: "absolute",
                            left: 0,
                            bottom: 0,
                            width: 250,
                            borderWidth: 1,
                            display: "flex",
                            flexDirection: "column",
                            backgroundColor: "white",
                        }}
                    >
                        <i>1 Tile = 1/2 Watch = 2 hours</i>

                        {cursorPos && `(${cursorPos[0]}, ${cursorPos[1]})`}
                        {selectedHex ? (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <span>
                                    <b>Selected: </b>
                                    {selectedHex.location ||
                                        selectedHex.encounter ||
                                        selectedHex.id}
                                </span>
                                <span>Precipitation: {selectedHex.shade}</span>
                                <span>Wind Speed: {selectedHex.wind}</span>
                            </div>
                        ) : null}
                        {hoveredHex ? (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                }}
                            >
                                <span>
                                    <b>Hovered: </b>
                                    {hoveredHex.location ||
                                        hoveredHex.encounter ||
                                        hoveredHex.id}
                                </span>
                                <span>Precipitation: {hoveredHex.shade}</span>
                                <span>Wind Speed: {hoveredHex.wind}</span>
                            </div>
                        ) : null}
                        <button onClick={() => setShowGrid(!showGrid)}>
                            Toggle Grid
                        </button>
                        <button onClick={() => setShowRain(!showRain)}>
                            Toggle Rain
                        </button>
                        <button
                            onClick={() => setShowLocations(!showLocations)}
                        >
                            Toggle Locations
                        </button>
                        <button onClick={() => setShowZones(!showZones)}>
                            Toggle Zones
                        </button>
                        <button
                            onClick={() => setCurrentWatch(currentWatch + 1)}
                        >
                            Next Watch
                        </button>
                        <select
                            onChange={(e) =>
                                setBackgroundId(Number(e.currentTarget.value))
                            }
                            defaultValue={"0"}
                        >
                            <option value="0">Biome</option>
                            <option value="1">Heightmap</option>
                            <option value="2">None</option>
                        </select>
                    </div>

                    {backgroundId === 1 ? (
                        <div
                            style={{
                                position: "absolute",
                                right: 0,
                                bottom: 0,
                                width: 100,
                                borderWidth: 1,
                                display: "flex",
                                flexDirection: "column",
                                backgroundColor: "green",
                            }}
                        >
                            <span style={{ backgroundColor: "#fbfbfb" }}>
                                +6000m
                            </span>
                            <span style={{ backgroundColor: "#e9e9e9" }}>
                                4500-6000m
                            </span>
                            <span style={{ backgroundColor: "#cecece" }}>
                                2500-4500m
                            </span>
                            <span style={{ backgroundColor: "#a6a6a6" }}>
                                1500-2500m
                            </span>
                            <span style={{ backgroundColor: "#626262" }}>
                                500-1500m
                            </span>
                            <span style={{ backgroundColor: "#404040" }}>
                                0-500m
                            </span>
                        </div>
                    ) : null}
                </TransformWrapper>
            </div>
            <div
                style={{
                    height: "100vh",
                    flex: 0.8,
                    position: "relative",
                }}
            >
                {currentSideTab === 0 && (
                    <TransformWrapper
                        initialScale={1}
                        minScale={0.1}
                        maxScale={1}
                        limitToBounds={false}
                        wheel={{ step: 10 }}
                        panning={{ excluded: ["textarea", "input"] }}
                    >
                        <TransformComponent
                            contentClass="main"
                            wrapperStyle={{
                                width: "auto",
                                height: "100%",
                                backgroundImage:
                                    "url(https://t3.ftcdn.net/jpg/01/24/97/32/360_F_124973262_ezHJqlYoEjnTDEmhf09HDLOne5yzXAt1.jpg)",
                            }}
                            wrapperClass="App"
                        >
                            {quests.map((q) => (
                                <div
                                    key={q.id}
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        width: 300,
                                        margin: 10,
                                    }}
                                >
                                    <input
                                        defaultValue={q.giver}
                                        onKeyDown={(e) => {
                                            const val = e.currentTarget.value;
                                            setQuests((prev) => {
                                                const clone =
                                                    structuredClone(prev);
                                                clone[
                                                    prev.findIndex(
                                                        (p) => p.id === q.id
                                                    )
                                                ].giver = val;
                                                return clone;
                                            });
                                        }}
                                    />
                                    <textarea
                                        style={{ height: 300 }}
                                        onKeyDown={(e) => {
                                            e.currentTarget.style.height = `${Math.min(
                                                e.currentTarget.scrollHeight,
                                                300
                                            )}px`;
                                            const val = e.currentTarget.value;
                                            setQuests((prev) => {
                                                const clone =
                                                    structuredClone(prev);
                                                clone[
                                                    prev.findIndex(
                                                        (p) => p.id === q.id
                                                    )
                                                ].details = val;
                                                return clone;
                                            });
                                        }}
                                        defaultValue={q.details}
                                    />
                                    <input
                                        defaultValue={q.reward}
                                        onKeyDown={(e) => {
                                            const val = e.currentTarget.value;
                                            setQuests((prev) => {
                                                const clone =
                                                    structuredClone(prev);
                                                clone[
                                                    prev.findIndex(
                                                        (p) => p.id === q.id
                                                    )
                                                ].reward = val;
                                                return clone;
                                            });
                                        }}
                                    />
                                </div>
                            ))}
                        </TransformComponent>
                    </TransformWrapper>
                )}

                {currentSideTab === 1 && (
                    <textarea
                        style={{ flex: 1 }}
                        defaultValue={
                            localStorage.getItem("notes") ||
                            "Some notes can go here"
                        }
                        onChange={(e) =>
                            localStorage.setItem("notes", e.currentTarget.value)
                        }
                    />
                )}

                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        bottom: 0,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {currentSideTab === 0 && (
                        <div>
                            <button
                                onClick={() =>
                                    setQuests([
                                        ...quests,
                                        {
                                            details: "",
                                            giver: "",
                                            id:
                                                quests.reduce((a, b) =>
                                                    a.id > b.id ? a : b
                                                ).id + 1,
                                            reward: "",
                                        },
                                    ])
                                }
                            >
                                Add Quest
                            </button>
                        </div>
                    )}
                    <div
                        style={{
                            display: "flex",
                        }}
                    >
                        <button
                            disabled={currentSideTab === 0}
                            onClick={() => setCurrentSideTab(0)}
                        >
                            Quests
                        </button>
                        <button
                            disabled={currentSideTab === 1}
                            onClick={() => setCurrentSideTab(1)}
                        >
                            Notes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default App;
