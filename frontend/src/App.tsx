import { useState } from 'react';
import { Dashboard } from './Dashboard';

function App() {
  const [imageBase64, setImageBase64] = useState<string>('');
  return (
    <>
      <Dashboard setImageBase64={setImageBase64} imageBase64={imageBase64} />
      {console.log(imageBase64)}
    </>
  );
}

export default App;
