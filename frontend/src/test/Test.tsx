import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import Chart from 'chart.js/auto';

export function Test() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [histogramData, setHistogramData] = useState(null);
  const [edgesData, setEdgesData] = useState(null);
  const [ContrastedImage, setContrastedImage] = useState(null);
  const [edgesImage, setEdgesImage] = useState(null);

  const [threshold1, setThreshold1] = useState(30);
  const [threshold2, setThreshold2] = useState(100);
  const [showEdges, setShowEdges] = useState(false);
  const [contrastLevel, setContrastLevel] = useState(50);
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
        // Read the uploaded file and convert it to base64
        const reader = new FileReader();
        reader.onload = function (event) {
          const base64String = event.target.result;
          setContrastedImage(base64String); // Store the base64 string in state
        };
        reader.readAsDataURL(selectedFile);
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
      });
  };

  const showHistogram = () => {
    const formData = new FormData();
    formData.append('base64_image', ContrastedImage);

    axios
      .post('http://localhost:8000/histogram', formData)
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
    const formData = new FormData();
    formData.append('base64_image', ContrastedImage);
    formData.append('threshold1', threshold1.toString());
    formData.append('threshold2', threshold2.toString());
    console.log(formData.get('threshold1'));
    axios
      .post('http://localhost:8000/detect_edges', formData)
      .then((response) => {
        setEdgesData(response.data);
        setEdgesImage(response.data.base64_image);
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

  // Event handler for contrast slider change
  const handleContrastChange = (value) => {
    setContrastLevel(value);
    sendContrastLevelToBackend(value[0]);
  };

  const sendContrastLevelToBackend = async (newContrastLevel) => {
    const baseUrl = 'http://localhost:8000';
    try {
      const response = await axios.post(baseUrl + '/adjust_contrast/', {
        image: ContrastedImage,
        contrast_level: newContrastLevel
      });
      setContrastedImage(response.data.adjusted_image_base64);
    } catch (error) {
      console.error('Error sending contrast level:', error);
    }
  };

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
          

          {ContrastedImage && (
            <div>
              <img src={ContrastedImage} alt="ContrastedImage" />
              {edgesImage && showEdges && (
                <img
                  src={edgesImage}
                  alt="EdgesImage"
                  style={{ position: 'absolute', top: 70, left: 0 }}
                />
              )}
            </div>
          )}
        </div>  
      )}

      <div className="grid gap-3">
        <Label htmlFor="Contrast">Contrast</Label>
        <Slider
          value={[contrastLevel]} // Use the state as the value
          max={100}
          step={1}
          onValueChange={handleContrastChange} // Bind the event handler
        />
      </div>
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
