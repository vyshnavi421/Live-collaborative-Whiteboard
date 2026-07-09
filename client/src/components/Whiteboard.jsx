import { useRef, useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Whiteboard() {

    const canvasRef = useRef(null);

    const lastPoint = useRef({ x: 0, y: 0 });

    const [drawing, setDrawing] = useState(false);
    const [color, setColor] = useState("#2b7a78");
    const [brushSize, setBrushSize] = useState(3);

    useEffect(() => {

        const canvas = canvasRef.current;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 70;

        const ctx = canvas.getContext("2d");

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        socket.on("drawing", (data) => {

            ctx.strokeStyle = data.color;
            ctx.lineWidth = data.size;

            ctx.beginPath();
            ctx.moveTo(data.prevX, data.prevY);
            ctx.lineTo(data.x, data.y);
            ctx.stroke();

        });

        socket.on("clear", () => {

            ctx.clearRect(0,0,canvas.width,canvas.height);

        });

        return ()=>{

            socket.off("drawing");
            socket.off("clear");

        }

    },[]);
        function startDrawing(e) {

        setDrawing(true);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        lastPoint.current = { x, y };

        ctx.beginPath();
        ctx.moveTo(x, y);

    }

    function draw(e) {

        if (!drawing) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const x = e.nativeEvent.offsetX;
        const y = e.nativeEvent.offsetY;

        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;

        ctx.beginPath();
        ctx.moveTo(
            lastPoint.current.x,
            lastPoint.current.y
        );

        ctx.lineTo(x, y);
        ctx.stroke();

        socket.emit("drawing",{

            prevX:lastPoint.current.x,
            prevY:lastPoint.current.y,

            x,
            y,

            color,
            size:brushSize

        });

        lastPoint.current={x,y};

    }

    function stopDrawing(){

        setDrawing(false);

    }

    function clearBoard(){

        const canvas=canvasRef.current;

        const ctx=canvas.getContext("2d");

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        socket.emit("clear");

    }

    function downloadImage(){

        const canvas=canvasRef.current;

        const link=document.createElement("a");

        link.download="whiteboard.png";

        link.href=canvas.toDataURL();

        link.click();

    }    return (
        <div>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    padding: "10px",
                    background: "#f4f4f4",
                    borderBottom: "1px solid #ddd"
                }}
            >

                <label>
                    🎨 Color
                    <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        style={{ marginLeft: "8px" }}
                    />
                </label>

                <label>
                    🖌 Brush
                    <input
                        type="range"
                        min="1"
                        max="20"
                        value={brushSize}
                        onChange={(e) =>
                            setBrushSize(Number(e.target.value))
                        }
                    />
                    {brushSize}px
                </label>

                <button onClick={clearBoard}>
                    🗑 Clear
                </button>

                <button onClick={downloadImage}>
                    ⬇ Download
                </button>

            </div>

            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{
                    display: "block",
                    background: "white",
                    cursor: "crosshair"
                }}
            />

        </div>
    );

}

export default Whiteboard;