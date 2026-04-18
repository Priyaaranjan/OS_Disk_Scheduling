import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [requests, setRequests] = useState("98,183,37,122,14,124,65,67");
  const [head, setHead] = useState(53);
  const [diskSize, setDiskSize] = useState(200);
  const [algorithm, setAlgorithm] = useState("FCFS");
  const [direction, setDirection] = useState("right");

  const [sequence, setSequence] = useState([]);
  const [seekTime, setSeekTime] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [running, setRunning] = useState(false);

  const simulate = () => {
    const req = requests
      .split(",")
      .map((x) => parseInt(x.trim()))
      .filter((x) => !isNaN(x));

    let current = Number(head);
    let seq = [current];
    let total = 0;

    if (algorithm === "FCFS") {
      req.forEach((r) => {
        total += Math.abs(current - r);
        current = r;
        seq.push(r);
      });
    }

    if (algorithm === "SSTF") {
      let remaining = [...req];

      while (remaining.length > 0) {
        let nearestIndex = 0;

        for (let i = 1; i < remaining.length; i++) {
          if (
            Math.abs(remaining[i] - current) <
            Math.abs(remaining[nearestIndex] - current)
          ) {
            nearestIndex = i;
          }
        }

        const next = remaining[nearestIndex];
        total += Math.abs(current - next);
        current = next;
        seq.push(next);
        remaining.splice(nearestIndex, 1);
      }
    }

    if (algorithm === "SCAN") {
      const left = req
        .filter((x) => x < current)
        .sort((a, b) => b - a);

      const right = req
        .filter((x) => x >= current)
        .sort((a, b) => a - b);

      if (direction === "right") {
        right.forEach((r) => {
          total += Math.abs(current - r);
          current = r;
          seq.push(r);
        });

        if (current !== diskSize - 1) {
          total += Math.abs(current - (diskSize - 1));
          current = diskSize - 1;
          seq.push(current);
        }

        left.forEach((r) => {
          total += Math.abs(current - r);
          current = r;
          seq.push(r);
        });
      } else {
        left.forEach((r) => {
          total += Math.abs(current - r);
          current = r;
          seq.push(r);
        });

        if (current !== 0) {
          total += current;
          current = 0;
          seq.push(current);
        }

        right.forEach((r) => {
          total += Math.abs(current - r);
          current = r;
          seq.push(r);
        });
      }
    }

    setSequence(seq);
    setSeekTime(total);
    setCurrentStep(0);
    setRunning(true);
  };

  useEffect(() => {
    if (!running) return;

    if (currentStep < sequence.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setRunning(false);
    }
  }, [running, currentStep, sequence]);

  const currentPosition = sequence[currentStep] || head;

  return (
    <div className="app">
      <div className="left-panel">
        <h1>Disk Scheduling Simulator</h1>

        <label>Request Queue</label>
        <input
          type="text"
          value={requests}
          onChange={(e) => setRequests(e.target.value)}
        />

        <label>Head Position</label>
        <input
          type="number"
          value={head}
          onChange={(e) => setHead(Number(e.target.value))}
        />

        <label>Disk Size</label>
        <input
          type="number"
          value={diskSize}
          onChange={(e) => setDiskSize(Number(e.target.value))}
        />

        <label>Algorithm</label>
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
        >
          <option value="FCFS">FCFS</option>
          <option value="SSTF">SSTF</option>
          <option value="SCAN">SCAN</option>
        </select>

        {algorithm === "SCAN" && (
          <>
            <label>Direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              <option value="right">Right</option>
              <option value="left">Left</option>
            </select>
          </>
        )}

        <button onClick={simulate}>Start Simulation</button>
      </div>

      <div className="right-panel">
        <div className="seek-card">
          <h2>Total Seek Time</h2>
          <div>{seekTime}</div>
        </div>

        <div className="track-box">
          <h2>Disk Head Simulation</h2>

          <div className="track">
            <div className="line"></div>

            <div
              className="head"
              style={{ left: `${(currentPosition / diskSize) * 100}%` }}
            >
              <div className="circle"></div>
              <span>{currentPosition}</span>
            </div>
          </div>
        </div>

        <div className="steps-box">
          <h2>Execution Steps</h2>

          <div className="steps">
            {sequence.map((item, index) => (
              <div
                key={index}
                className={`step ${index <= currentStep ? "active" : ""}`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
