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

  //  Fadi : hethi bch yab3th il value t3 il contrast each time t7arik il slider  

   // Event handler for contrast slider change
   const handleContrastChange = (value : any) => {
    setContrastLevel(value);
    sendContrastLevelToBackend(value[0]);
  };

  const sendContrastLevelToBackend = async (newContrastLevel: any) => {
    const baseUrl = 'http://localhost:8000';
      try {
          const response = await axios.get( baseUrl +'/adjust_contrast/', {
              params: {
                  contrast_level: newContrastLevel,
              },
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
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Selected"
            width="200"
          />
          
           <img
              src={`data:image/jpeg;base64,${ContrastedImage}`}
              alt="ContrastedImage"
            />
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
