import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

export function Test() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [histogramData, setHistogramData] = useState(null);
  const [edgesData, setEdgesData] = useState(null);
  const [threshold1, setThreshold1] = useState(30);
  const [threshold2, setThreshold2] = useState(100);
  const [showEdges, setShowEdges] = useState(false);
  const chartInstance = useRef(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    const formData = new FormData();
    formData.append('image', selectedFile);

    axios
      .post('http://localhost:8000/upload/', formData)
      .then((response) => {
        alert(response.data.message);
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
      });
  };

  const showHistogram = () => {
    axios
      .get('http://localhost:8000/histogram')
      .then((response) => {
        setHistogramData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching histogram data:', error);
      });
  };

  const toggleEdges = () => {
    setShowEdges(!showEdges);
  };

  const showEdgesData = () => {
    axios
      .get(
        `http://localhost:8000/detect_edges?threshold1=${threshold1}&threshold2=${threshold2}`
      )
      .then((response) => {
        setEdgesData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching edges data:', error);
      });
  };

  const renderHistogramChart = () => {
    if (histogramData) {
      const ctx = document.getElementById('histogramChart').getContext('2d');

      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Array.from(Array(256).keys()),
          datasets: [
            {
              label: 'Blue Channel',
              data: histogramData.hist_blue,
              backgroundColor: 'blue',
              borderColor: 'blue'
            },
            {
              label: 'Green Channel',
              data: histogramData.hist_green,
              backgroundColor: 'green',
              borderColor: 'green'
            },
            {
              label: 'Red Channel',
              data: histogramData.hist_red,
              backgroundColor: 'red',
              borderColor: 'red'
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  };

  useEffect(() => {
    renderHistogramChart();
  }, [histogramData]);

  useEffect(() => {
    if (showEdges) {
      showEdgesData();
    } else {
      setEdgesData(null);
    }
  }, [showEdges, threshold1, threshold2]);

  return (
    <div className="App">
      <h1>Image Upload, Histogram, and Edges Display</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload Image</button>
      <button onClick={showHistogram}>Show Histogram</button>
      <button onClick={toggleEdges}>
        {showEdges ? 'Hide Edges' : 'Show Edges'}
      </button>
      {selectedFile && (
        <div>
          <h2>Selected Image:</h2>
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Selected"
            width="200"
          />
        </div>
      )}
      <div className="h-[500px] w-[600px]">
        <h2>{showEdges ? 'Edges' : 'Histogram'}</h2>
        <canvas id="histogramChart"></canvas>

        {showEdges && edgesData && (
          <div>
            <div>
              <label>Threshold 1: {threshold1}</label>
              <input
                type="range"
                min="0"
                max="255"
                value={threshold1}
                onChange={(e) => setThreshold1(parseInt(e.target.value))}
              />
            </div>
            <div>
              <label>Threshold 2: {threshold2}</label>
              <input
                type="range"
                min="0"
                max="255"
                value={threshold2}
                onChange={(e) => setThreshold2(parseInt(e.target.value))}
              />
            </div>
            <img
              src={`data:image/jpeg;base64,${edgesData.edges}`}
              alt="Edges"
            />
          </div>
        )}
      </div>
    </div>
  );
}
