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
      <h2 className="text-xl font-bold">Exportar Plano de Carregamento</h2>
      
      {placedItems.length === 0 ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum item foi colocado no caminhão ainda. Adicione alguns itens para gerar uma exportação.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-secondary/30 p-3 rounded-md">
              <h3 className="font-medium mb-1">Volume do Caminhão</h3>
              <p className="text-sm text-muted-foreground">
                {stats.truckVolume.toFixed(2)} unidades cúbicas
              </p>
            </div>
            <div className="bg-secondary/30 p-3 rounded-md">
              <h3 className="font-medium mb-1">Volume Utilizado</h3>
              <p className="text-sm text-muted-foreground">
                {stats.usedVolume.toFixed(2)} unidades cúbicas ({stats.usagePercentage.toFixed(1)}%)
              </p>
            </div>
            <div className="bg-secondary/30 p-3 rounded-md">
              <h3 className="font-medium mb-1">Itens Colocados</h3>
              <p className="text-sm text-muted-foreground">
                {stats.itemCount} de {stats.totalItems} disponíveis
              </p>
            </div>
            <div className="bg-secondary/30 p-3 rounded-md">
              <h3 className="font-medium mb-1">Gerado Em</h3>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Dados do Plano de Carregamento</h3>
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
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-4 w-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </Button>
                <Button 
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  <span>Baixar</span>
                </Button>
              </div>
            </div>
            
            <Textarea
              className="font-mono text-xs h-64"
              value={generateExportData()}
              readOnly
            />
            
            <p className="text-xs text-muted-foreground">
              Esses dados podem ser importados posteriormente para restaurar seu plano de carregamento ou compartilhados com colegas.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportPanel;
