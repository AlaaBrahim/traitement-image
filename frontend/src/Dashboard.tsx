import {
  Bird,
  Book,
  Bot,
  Code2,
  LifeBuoy,
  Rabbit,
  Settings,
  Settings2,
  Share,
  SquareTerminal,
  SquareUser,
  Triangle,
  Turtle
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from "@/components/ui/switch"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';


export function Dashboard() {
  const handleDragStart = (e: React.DragEvent<HTMLImageElement>) => {
    e.preventDefault(); // Prevents displaying alt text while dragging
    e.dataTransfer.setData('text/plain', e.currentTarget.src);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const imageUrl = e.dataTransfer.getData('text/plain');
    if (e.currentTarget.firstChild instanceof HTMLImageElement) {
      e.currentTarget.firstChild.src = imageUrl;
    }
  };
  return (
    <div className="grid h-screen w-full pl-[56px]">
      <TooltipProvider>

        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-[57px] items-center gap-1 border-b bg-background px-4">
            <h1 className="text-xl font-semibold">Photo Editing Website</h1>
            <div className="flex items-start">
              <Button
                variant="outline"
                size="sm"
                className="ml-auto gap-1.5 text-sm"
              >
                <Share className="size-3.5" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto gap-1.5 text-sm"
              >
                <Share className="size-3.5" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="ml-auto gap-1.5 text-sm"
              >
                <Share className="size-3.5" />
                Save
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

                  <div className="grid gap-3">
                    <Label htmlFor="Contrast">Contrast</Label>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="Brightness">Brightness</Label>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="Saturation ">Saturation </Label>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="Hue ">Hue </Label>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="Gamma Correction">Gamma Correction</Label>
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>

                </fieldset>
                <fieldset className="grid gap-6 rounded-lg border p-4">
                  <legend className="-ml-1 px-1 text-sm font-medium">
                    Filters
                  </legend>
                  <div className="grid gap-3">
                    <Label htmlFor="role">Choose Filters to be Applied</Label>
                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <p>Grayscale</p>
                      <Switch />
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <p>Averaging </p>
                      <Switch />
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <p>Median </p>
                      <Switch />
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <p>Minimum  </p>
                      <Switch />
                    </div>

                    <div className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <p>Maximum  </p>
                      <Switch />
                    </div>

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
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <img
                  src="https://source.unsplash.com/random"
                  alt="Placeholder"
                  draggable={true}
                  onDragStart={handleDragStart}
                />
              </div>
            </div>
          </main>
        </div>
      </TooltipProvider>
    </div>
  );
}
