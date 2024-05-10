import React, { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { capitalizeFirstLetter } from './utils';

export interface DynamicStatesProps {
  componentName: string; // Name of the component
  edits: object; // Edits object
  setEdits: (edits: object) => void; // Function to set the edits
}

export const DynamicToggle: React.FC<DynamicStatesProps> = ({
  componentName,
  edits,
  setEdits
}) => {
  const [toggeled, setToggeled] = useState(false);

  useEffect(() => {
    setEdits({
      ...edits,
      [componentName]: {
        enabled: toggeled
      }
    });
  }, [toggeled]);

  return (
    <>
      <div className="flex flex-row items-center justify-between rounded-lg border p-4">
        <p>{capitalizeFirstLetter(componentName)} </p>
        <Switch
          onClick={() => {
            setToggeled(!toggeled);
          }}
        />
      </div>
    </>
  );
};

export default DynamicToggle;
