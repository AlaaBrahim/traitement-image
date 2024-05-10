import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';

export interface DynamicStatesProps {
  stateNames: string; // Comma-separated state names
  componentName: string; // Name of the component
  edits: object; // Edits object
  setEdits: (edits: object) => void; // Function to set the edits
}

export const DynamicToggleSlides: React.FC<DynamicStatesProps> = ({
  componentName,
  stateNames,
  edits,
  setEdits
}) => {
  // Split the comma-separated string into an array of state names
  const stateNamesArray = stateNames.split(',').map((name) => name.trim());

  // Create a state object to hold all the states
  const initialStates: { [key: string]: any } = {};
  stateNamesArray.forEach((name) => {
    initialStates[name] = ''; // Default value for each state
  });

  const [states, setStates] = useState(initialStates);

  // Handler to update state based on the name and value
  const handleChange = (name: string, value: any) => {
    setStates((prevStates) => ({
      ...prevStates,
      [name]: value
    }));
  };

  const [toggeled, setToggeled] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    setEdits({
      ...edits,
      [componentName]: {
        enabled: toggeled,
        ...states
      }
    });
  }, [updated, toggeled]);

  return (
    <>
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <p>Toggle {componentName} </p>
        <Switch
          onClick={() => {
            setToggeled(!toggeled);
          }}
        />
      </div>
      {toggeled && (
        <div>
          {stateNamesArray.map((name) => (
            <div key={name} className="ml-2 mt-1">
              <label htmlFor={name}>{name}: </label>
              <label className="mx-2">{states[name]}</label>

              <input
                type="range"
                min="0"
                max="255"
                value={states[name]}
                onChange={(e) => handleChange(name, parseInt(e.target.value))}
                onMouseUp={() => setUpdated(!updated)}
                onTouchEnd={() => setUpdated(!updated)}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default DynamicToggleSlides;
