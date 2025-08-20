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
	const [currentTime, setCurrentTime] = useState<number>(4);

	useEffect(() => {
		advanceTime();
		if (Math.floor(Math.random() * 20) + 1 >= 17) {
			setTimeout(
				() =>
					alert(
						"A random travel complication appears! Number " +
							(Math.floor(Math.random() * 12) + 1)
					),
				200
			);
		}
	}, [currentWatch]);

	const advanceTime = () => setCurrentTime((currentTime + 2) % 24);

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
					wheel={{ step: 10 }}
					doubleClick={{ disabled: true }}
					panning={{ excluded: ["textarea"] }}
				>
					<TransformComponent
						wrapperStyle={{ height: "100%", width: "100%" }}
					>
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
						Current Time: {currentTime}:00
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
		</div>
	);
};

export default App;
