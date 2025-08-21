import { useState } from "react";
import { Trash2, RotateCcw, Database, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface WidgetClearControlsProps {
  onClearData: () => void;
  onRestoreData: () => void;
  onLoadDummyData: () => void;
  hasData?: boolean;
  hasDeletedData?: boolean;
  widgetName: string;
}

export default function WidgetClearControls({ 
  onClearData, 
  onRestoreData, 
  onLoadDummyData, 
  hasData = false,
  hasDeletedData = false,
  widgetName 
}: WidgetClearControlsProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);

  const handleClearConfirm = () => {
    onClearData();
    setShowClearDialog(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white/60 hover:text-white hover:bg-white/10"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => setShowClearDialog(true)}
            disabled={!hasData}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Data
          </DropdownMenuItem>
          
          <DropdownMenuItem
            onClick={onRestoreData}
            disabled={!hasDeletedData}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Restore Data
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={onLoadDummyData}>
            <Database className="h-4 w-4 mr-2" />
            Load Sample Data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear {widgetName} Data</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all data in the {widgetName} widget. 
              You can restore it using the "Restore Data" option if needed.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Clear Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}