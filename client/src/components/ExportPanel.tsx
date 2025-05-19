import { useState } from "react";
import { Button } from "./ui/button";
import { useFurnitureStore } from "../lib/stores/useFurnitureStore";
import { useTruckStore } from "../lib/stores/useTruckStore";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertCircle, Download, Clipboard, Check } from "lucide-react";

const ExportPanel = () => {
  const { items, placedItems } = useFurnitureStore();
  const { truckDimensions } = useTruckStore();
  const [copied, setCopied] = useState(false);
  
  // Calculate loading statistics
  const calculateStats = () => {
    const truckVolume = truckDimensions.width * truckDimensions.height * truckDimensions.depth;
    const usedVolume = placedItems.reduce((acc, item) => {
      return acc + (item.width * item.height * item.depth);
    }, 0);
    
    return {
      truckVolume,
      usedVolume,
      usagePercentage: (usedVolume / truckVolume) * 100,
      itemCount: placedItems.length,
      totalItems: items.length
    };
  };
  
  const stats = calculateStats();
  
  // Generate export data
  const generateExportData = () => {
    const exportData = {
      truckDimensions,
      loadingDate: new Date().toISOString(),
      statistics: {
        truckVolume: stats.truckVolume,
        usedVolume: stats.usedVolume,
        usagePercentage: stats.usagePercentage,
        placedItems: stats.itemCount,
        totalAvailableItems: stats.totalItems
      },
      placedItems: placedItems.map(item => ({
        id: item.id,
        name: item.name,
        dimensions: {
          width: item.width,
          height: item.height,
          depth: item.depth
        },
        position: item.position,
        rotation: item.rotation,
        color: item.color
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  };
  
  // Handle data copying
  const handleCopy = () => {
    const exportData = generateExportData();
    navigator.clipboard.writeText(exportData).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Handle data download
  const handleDownload = () => {
    const exportData = generateExportData();
    const blob = new Blob([exportData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = `truck-loading-plan-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Export Loading Plan</h2>
      
      {placedItems.length === 0 ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No items have been placed in the truck yet. Add some items to generate an export.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-secondary/30 p-3 rounded-md">
              <h3 className="font-medium mb-1">Truck Volume</h3>
              <p className="text-sm text-muted-foreground">
                {stats.truckVolume.toFixed(2)} cubic units
              </p>
            </div>
            <div className="bg-secondary/30 p-3 rounded-md">
              <h3 className="font-medium mb-1">Used Volume</h3>
              <p className="text-sm text-muted-foreground">
                {stats.usedVolume.toFixed(2)} cubic units ({stats.usagePercentage.toFixed(1)}%)
              </p>
            </div>
            <div className="bg-secondary/30 p-3 rounded-md">
              <h3 className="font-medium mb-1">Items Placed</h3>
              <p className="text-sm text-muted-foreground">
                {stats.itemCount} of {stats.totalItems} available
              </p>
            </div>
            <div className="bg-secondary/30 p-3 rounded-md">
              <h3 className="font-medium mb-1">Generated On</h3>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Loading Plan Data</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-4 w-4" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
                <Button 
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
              </div>
            </div>
            
            <Textarea
              className="font-mono text-xs h-64"
              value={generateExportData()}
              readOnly
            />
            
            <p className="text-xs text-muted-foreground">
              This data can be imported later to restore your loading plan or shared with colleagues.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportPanel;
