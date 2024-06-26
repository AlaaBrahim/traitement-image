/* eslint-disable @typescript-eslint/no-unused-vars */
import { Download, Settings, Share, Printer } from 'lucide-react';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer';
import { Label } from '@/components/ui/label';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useRef, useEffect } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';

import './Dashboard.css';
import { printImage, saveImage } from './ImageUtils';
import DynamicToggle from './DynamicToggle';
import DynamicToggleSlides from './DynamicToggleSlides';
import DynamicSlider from './DynamicSlider';
export function Dashboard() {
  const [imageBase64, setImageBase64] = useState<string>('');
  const [originalImageBase64, setoriginalImageBase64] = useState<string>('');

  const [histogramData, setHistogramData] = useState(null);
  const [showHistogram, setShowHistogram] = useState(false);

  const chartInstance = useRef(null);

  const [edits, setEdits] = useState<object>({});

  useEffect(() => {
    // send the edits object as well as the originalImageBase64 to the backend, then update the imageBase64 with the new image
    const sendEditsToBackend = async () => {
      const baseUrl = 'http://localhost:8000';
      const formData = new FormData();
      formData.append('base64_image', originalImageBase64);
      formData.append('edits', JSON.stringify(edits));
      try {
        const response = await axios.post(baseUrl + '/edit_image', formData);
        setImageBase64(response.data.base64_image);
      } catch (error) {
        console.error('Error sending edits:', error);
      }
    };
    sendEditsToBackend();
  }, [edits, originalImageBase64]);

  // ------------ HISTOGRAM -----------------------------------------

  const handleHistogram = () => {
    const formData = new FormData();
    formData.append('base64_image', imageBase64);

    axios
      .post('http://localhost:8000/histogram', formData)
      .then((response) => {
        setHistogramData(response.data);
      })
      .catch((error) => {
        console.error('Error fetching histogram data:', error);
      });
  };

  const toggleShowHistogram = () => {
    setShowHistogram(!showHistogram);
    if (!showHistogram) {
      handleHistogram();
      renderHistogramChart();
    }
  };
  const renderHistogramChart = () => {
    if (histogramData) {
      const canvas = document.getElementById('histogramChart');
      if (canvas) {
        const ctx = canvas.getContext('2d');

        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        // IF SHOW EDGES IS TOGGLED
        if (histogramData.type === 'bw') {
          chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: Array.from(Array(256).keys()),
              datasets: [
                {
                  label: 'Histogram',
                  data: histogramData.hist,
                  backgroundColor: 'gray',
                  borderColor: 'gray',
                  barThickness: 'flex', // Set the bar thickness here
                  categoryPercentage: 1.0 // Ensure the bars fill the whole category space
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
        } else {
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
      }
    }
  };

  useEffect(() => {
    handleHistogram();
  }, [imageBase64]);

  useEffect(() => {
    renderHistogramChart();
  }, [histogramData]);

  // -------------------------------------------------------------

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Cleanup function for event listeners
    const handleBeforePrint = () => {
      if (imageBase64) {
        printImage(imageBase64);
      }
    };

    window.addEventListener('beforeprint', handleBeforePrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
    };
  }, [imageBase64]); // Re-run the effect when the image changes

  return (
    <div className="grid h-screen w-full pl-[56px]">
      <TooltipProvider>
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
            <h1 className="text-xl font-semibold">Adjust the Photo:</h1>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Settings className="size-4" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="max-h-[80vh]">
                <DrawerHeader>
                  <DrawerTitle>Configuration</DrawerTitle>
                  <DrawerDescription>
                    Configure the settings for the model and messages.
                  </DrawerDescription>
                </DrawerHeader>
                <form className="grid w-full items-start gap-6 overflow-auto p-4 pt-0">
                  <fieldset className="grid gap-6 rounded-lg border p-4">
                    <legend className="-ml-1 px-1 text-sm font-medium">
                      Photo Adjustments
                    </legend>

                    <DynamicSlider
                      componentName="contrast"
                      setEdits={setEdits}
                      edits={edits}
                    />

                    <DynamicSlider
                      componentName="luminance"
                      setEdits={setEdits}
                      edits={edits}
                    />
                  </fieldset>

                  <fieldset className="grid gap-6 rounded-lg border p-4">
                    <legend className="-ml-1 px-1 text-sm font-medium">
                      Filters
                    </legend>
                    <div className="grid gap-3">
                      <Label htmlFor="role">Choose Filters to be Applied</Label>
                      <DynamicToggle
                        componentName="grayscale"
                        edits={edits}
                        setEdits={setEdits}
                      />

                      <DynamicToggleSlides
                        componentName="mean"
                        edits={edits}
                        setEdits={setEdits}
                        stateNames="Size"
                      />

                      <DynamicToggleSlides
                        componentName="median"
                        edits={edits}
                        setEdits={setEdits}
                        stateNames="Size"
                      />

                      <DynamicToggleSlides
                        componentName="minimum"
                        edits={edits}
                        setEdits={setEdits}
                        stateNames="Size"
                      />

                      <DynamicToggleSlides
                        componentName="maximum"
                        edits={edits}
                        setEdits={setEdits}
                        stateNames="Size"
                      />
                    </div>
                  </fieldset>
                </form>
              </DrawerContent>
            </Drawer>
            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                className="m-1 gap-1.5 text-sm"
                onClick={() => inputRef.current?.click()}
              >
                <input
                  type="file"
                  className="hidden"
                  ref={inputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        setImageBase64(e.target?.result as string);
                        setoriginalImageBase64(e.target?.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <Share className="size-3.5" />
                Upload
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="m-1 gap-1.5 text-sm"
                onClick={() => {
                  saveImage(imageBase64);
                }}
              >
                <Download className="size-3.5" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="m-1 gap-1.5 text-sm"
                onClick={() => printImage(imageBase64)}
              >
                <Printer className="size-3.5" />
                Print
              </Button>
            </div>
          </header>
          <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
            <div
              className="relative hidden flex-col items-start gap-8 md:flex"
              x-chunk="dashboard-03-chunk-0"
            >
              <form className="grid w-full items-start gap-6">
                <fieldset className="grid gap-6 rounded-lg border p-4">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Photo Adjustments
                  </legend>

                  <DynamicSlider
                    componentName="contrast"
                    setEdits={setEdits}
                    edits={edits}
                  />
                  <DynamicSlider
                    componentName="luminance"
                    setEdits={setEdits}
                    edits={edits}
                  />
                </fieldset>
                <fieldset className="grid gap-6 rounded-lg border p-4">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Filters
                  </legend>
                  <div className="grid gap-3">
                    <Label htmlFor="role">Choose Filters to be Applied</Label>
                    <DynamicToggle
                      componentName="grayscale"
                      edits={edits}
                      setEdits={setEdits}
                    />

                    <DynamicToggleSlides
                      componentName="edges"
                      edits={edits}
                      setEdits={setEdits}
                      stateNames="Threshold1, Threshold2"
                    />

                    <DynamicToggleSlides
                      componentName="mean"
                      edits={edits}
                      setEdits={setEdits}
                      stateNames="Size"
                    />

                    <DynamicToggleSlides
                      componentName="median"
                      edits={edits}
                      setEdits={setEdits}
                      stateNames="Size"
                    />

                    <DynamicToggleSlides
                      componentName="minimum"
                      edits={edits}
                      setEdits={setEdits}
                      stateNames="Size"
                    />

                    <DynamicToggleSlides
                      componentName="maximum"
                      edits={edits}
                      setEdits={setEdits}
                      stateNames="Size"
                    />
                    {/*___ HISTOGRAM ____ */}

                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <p>Show histogram </p>
                      <Switch onClick={toggleShowHistogram} />
                    </div>
                    {showHistogram && (
                      <div>
                        <canvas id="histogramChart"></canvas>
                      </div>
                    )}
                    {/*_________________ */}
                  </div>
                </fieldset>
              </form>
            </div>
            <div className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
              <Badge variant="outline" className="absolute right-3 top-3">
                Output
              </Badge>
              <div className="flex-1" />
              <div
                className="flex items-center justify-center h-full bg-muted/50 rounded-xl p-7"
                // onDragOver={handleDragOver}
                // onDrop={handleDrop}
              >
                <img src={imageBase64} alt="Original Image" draggable={true} />
              </div>
            </div>
          </main>
        </div>
      </TooltipProvider>
    </div>
  );
}
