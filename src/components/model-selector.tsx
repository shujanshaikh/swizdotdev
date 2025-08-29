import { models } from "~/lib/model/model";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { InfoIcon } from "lucide-react";


export default function ModelSelector({ model, setModel }: { model: string, setModel: (model: string) => void }) {
    return (
        <div className="flex items-center gap-2 px-3 absolute bottom-3 right-16"> 
          <Select
            value={model}
            onValueChange={(value) => {
              setModel(value);
            }}
          >
            <SelectTrigger className="bg-white/5 border-none text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 h-9 px-3 text-sm rounded-lg">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 rounded-lg min-w-[200px]">
              {models.map((modelItem) => (
                <SelectItem 
                  key={modelItem.value} 
                  value={modelItem.value}
                  className="hover:bg-white/10 focus:bg-white/10 cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium text-white mr-2">{modelItem.name}</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="h-4 w-4 text-white/60" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{modelItem.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
    );
}