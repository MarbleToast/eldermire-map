import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
import noise from "./noise/Noise";
import { HexagonData } from "./App";
import locations from "./locations";
import zonePaths from "./zones";
import Noise from "./noise/Noise";
import autoencounters from "./autoencounters";

function hexagon(x: number, y: number, r: number) {
    let angle = 0;
    const path = new Path2D();
    for (let i = 0; i < 6; i++) {
        path.lineTo(x + Math.cos(angle) * r, y + Math.sin(angle) * r);
        angle += Math.PI / 3;
    }
    path.closePath();
    return path;
}

const getShading = (x: number, y: number) => {
    const scale = 0.01;
    const value =
        (new Noise(Math.random()).perlin2(x * scale, y * scale) + 1) / 2;
    return Math.min(Math.floor(value * 30 - 1), 20);
};

const getWind = (x: number, y: number) => {
    const scale = 1;
    const value =
        (new Noise(Math.random()).perlin2(x * scale, y * scale) + 1) / 2;
    return Math.min(Math.floor(value * 30 - 1), 20);
};

interface CanvasProps {
    backgroundAsString: string;
    hexs: HexagonData[];
    setHexs: (h: HexagonData[]) => void;
    setCursorPos: (p: [number, number]) => void;
    showGrid: boolean;
    showLocations: boolean;
    showRain: boolean;
    showZones: boolean;
    currentSelected: number | null;
    setCurrentSelected: (n: number) => void;
    currentHovered: number | null;
    setCurrentHovered: (n: number) => void;
    currentWatch: number;
}

const Canvas: React.FC<CanvasProps> = ({
    backgroundAsString,
    hexs,
    setHexs,
    setCursorPos,
    showGrid,
    showLocations,
    showRain,
    showZones,
    currentHovered,
    currentSelected,
    setCurrentHovered,
    setCurrentSelected,
    currentWatch,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [_, setDebugPath] = useState<number[][]>([]);

    useEffect(() => {
        showGrid && drawAll(true);
    }, [currentWatch]);
    useEffect(() => {
        showGrid && drawAll(false);
    }, [currentSelected, currentHovered]);
    useEffect(() => {
        clearCanvas();
        drawAll(false);
    }, [showGrid, showLocations, showRain, showZones]);

    const drawAll = (refresh?: boolean) => {
        const canvas = canvasRef.current;
        const drawingPaths = [];

        if (canvas) {
            const context = canvas.getContext("2d");
            if (context) {
                clearCanvas();

                const radius = 8;
                const ydelta = Math.sin(Math.PI / 3) * radius;
                let even = true;

                if (hexs.length > 0 && !refresh) {
                    hexs.forEach((h, i) => {
                        if (h.location && showLocations) {
                            context.fillStyle = "red";
                            context.lineWidth = 1;
                            context.strokeStyle = "pink";
                            context.setLineDash([]);
                        } else if (h.encounter && showLocations) {
                            context.fillStyle = "rgba(64, 0, 64, 0.5)";
                            context.lineWidth = 1.5;
                            context.strokeStyle = "pink";
                            context.setLineDash([3, 3]);
                        } else {
                            context.lineWidth = 0.1;
                            context.strokeStyle = "black";
                            context.setLineDash([]);
                            if (showRain)
                                context.fillStyle = `rgba(0, 0, 255, ${
                                    h.shade > 13
                                        ? ((h.shade - 13) / 7) * 0.8
                                        : 0
                                })`;
                            else context.fillStyle = "transparent";
                        }

                        if (i === currentSelected) {
                            context.fillStyle = "orange";
                        } else if (i === currentHovered) {
                            context.fillStyle = "yellow";
                        }

                        context.fill(h.path);
                        showGrid && context.stroke(h.path);
                    });
                } else {
                    let i = 0;
                    for (let y = 0; y < canvasRef.current.height; y += ydelta) {
                        let offset = 0;
                        if (even) {
                            offset = radius * 1.5;
                        }
                        for (
                            let x = 0;
                            x < canvasRef.current.width;
                            x += radius * 3
                        ) {
                            const path = hexagon(x + offset, y, radius);
                            const shade = getShading(x + offset, y);

                            if (locations[i] && showLocations) {
                                context.fillStyle = "red";
                                context.lineWidth = 1;
                                context.strokeStyle = "pink";
                                context.setLineDash([]);
                            } else if (autoencounters[i] && showLocations) {
                                context.fillStyle = "rgba(100, 255, 40, 0.5)";
                                context.lineWidth = 1.5;
                                context.strokeStyle = "pink";
                                context.setLineDash([3, 3]);
                            } else {
                                context.lineWidth = 0.1;
                                context.strokeStyle = "black";
                                context.setLineDash([]);
                                if (showRain)
                                    context.fillStyle = `rgba(0, 0, 255, ${
                                        shade > 13
                                            ? ((shade - 13) / 7) * 0.8
                                            : 0
                                    })`;
                                else context.fillStyle = "transparent";
                            }

                            if (i === currentSelected) {
                                context.fillStyle = "orange";
                            } else if (i === currentHovered) {
                                context.fillStyle = "yellow";
                            }

                            context.fill(path);
                            showGrid && context.stroke(path);

                            drawingPaths.push({
                                id: i,
                                path,
                                shade,
                                wind: getWind(x, y),
                                location: locations[i],
                                encounter: autoencounters[i],
                            });
                            i++;
                        }
                        even = !even;
                    }
                    setHexs(drawingPaths);
                }

                if (showZones) {
                    context.strokeStyle = "white";
                    context.textAlign = "center";
                    zonePaths.forEach((z) => {
                        context.fillStyle = z.colour;
                        const path = new Path2D();
                        let minX = 10000,
                            maxX = 0,
                            minY = 10000,
                            maxY = 0;
                        z.path.forEach(([x, y]) => {
                            path.lineTo(x, y);
                            if (x < minX) {
                                minX = x;
                            }
                            if (x > maxX) {
                                maxX = x;
                            }

                            if (y < minY) {
                                minY = y;
                            }
                            if (y > maxY) {
                                maxY = y;
                            }
                        });
                        path.closePath();

                        context.globalAlpha = 0.3;
                        context.lineWidth = 2;
                        context.stroke(path);
                        context.fill(path);

                        context.globalAlpha = 1;
                        context.fillStyle = "black";
                        context.fillText(
                            z.name,
                            minX + (maxX - minX) / 2,
                            minY + (maxY - minY) / 2
                        );
                    });
                }
            }
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.globalAlpha = 1;
            }
        }
    };

    const handleDoubleClick: MouseEventHandler<HTMLCanvasElement> = (e) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const bound = canvas.getBoundingClientRect();

                const x = e.clientX - bound.left - canvas.offsetLeft,
                    y = e.clientY - bound.top - canvas.offsetTop;

                setCurrentSelected(
                    hexs.findIndex((h) => ctx.isPointInPath(h.path, x, y))
                );
            }
        }
    };

    const handleClick: MouseEventHandler<HTMLCanvasElement> = (e) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const bound = canvas.getBoundingClientRect();

                const x = e.clientX - bound.left - canvas.offsetLeft,
                    y = e.clientY - bound.top - canvas.offsetTop;

                setDebugPath((p) => {
                    const n = [...p, [x, y]];
                    console.log(n);
                    return n;
                });
            }
        }
    };

    const handleHover: MouseEventHandler<HTMLCanvasElement> = (e) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (ctx) {
                const bound = canvas.getBoundingClientRect();

                const x = e.clientX - bound.left - canvas.offsetLeft,
                    y = e.clientY - bound.top - canvas.offsetTop;

                setCurrentHovered(
                    hexs.findIndex((h) => ctx.isPointInPath(h.path, x, y))
                );

                setCursorPos([x, y]);
            }
        }
    };

    return (
        <canvas
            style={{
                backgroundImage: `url("data:image/svg+xml,${backgroundAsString}")`,
                cursor: "pointer",
            }}
            onDoubleClick={handleDoubleClick}
            onMouseMove={handleHover}
            onClick={handleClick}
            width="1000"
            height="800"
            ref={canvasRef}
        />
    );
};

export default Canvas;
