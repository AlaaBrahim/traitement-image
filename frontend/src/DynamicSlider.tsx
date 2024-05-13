import React, { useEffect, useState } from 'react';
import { capitalizeFirstLetter } from './utils';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export interface DynamicStatesProps {
  componentName: string; // Name of the component
  edits: object; // Edits object
  setEdits: (edits: object) => void; // Function to set the edits
}

export const DynamicSlider: React.FC<DynamicStatesProps> = ({
  componentName,
  edits,
  setEdits
}) => {
  const [value, setValue] = useState(50);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    setEdits({
      ...edits,
      [componentName]: {
        enabled: true,
        value: value
      }
    });
  }, [updated]);

  return (
    <>
      <div className="grid gap-3">
        <Label htmlFor="Contrast">{capitalizeFirstLetter(componentName)}</Label>
        <Slider
          value={[value]} // Use the state as the value
          max={100}
          step={1}
          onValueChange={(e) => setValue(e[0])} // Bind the event handler
          onValueCommit={() => setUpdated(!updated)}
        />
      </div>
    </>
  );
};

export default DynamicSlider;
