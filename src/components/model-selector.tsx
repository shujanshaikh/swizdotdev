import { models } from "~/lib/model/model";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { InfoIcon } from "lucide-react";
import { openRouterModel } from "~/lib/model/open-router";


export default function ModelSelector({ model, setModel }: { model: string, setModel: (model: string) => void }) {
    return (
        <div className="flex items-center gap-2 px-3 absolute bottom-3 right-16">
          <Select
            value={model}
            onValueChange={(value) => {
              setModel(value);
            }}
          >
            <SelectTrigger className="bg-gradient-to-br from-zinc-900/60 via-zinc-900/40 to-zinc-800/60 border border-white/10 text-white/85 hover:text-white hover:border-white/20 hover:from-zinc-800/70 hover:via-zinc-800/50 hover:to-zinc-700/70 transition-all duration-300 h-8 px-3 text-sm rounded-md shadow-sm backdrop-blur-sm">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent className="bg-gradient-to-br from-zinc-900/95 via-zinc-900/90 to-zinc-800/95 backdrop-blur-md border-white/10 rounded-lg min-w-[200px] shadow-xl">
              {openRouterModel.map((modelItem) => (
                <SelectItem
                  key={modelItem.value}
                  value={modelItem.value}
                  className="hover:bg-gradient-to-r hover:from-white/5 hover:to-white/10 focus:bg-gradient-to-r focus:from-white/5 focus:to-white/10 cursor-pointer transition-all duration-200 py-2.5"
                >
                  <div className="flex items-center justify-between w-full group">
                    <div className="flex-1 mr-2">
                      <span className="font-medium text-white/90 group-hover:text-white/95 text-sm transition-colors duration-200">{modelItem.name}</span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-zinc-800/60 to-zinc-900/60 hover:from-zinc-700/70 hover:to-zinc-800/70 transition-all duration-200 cursor-help border border-white/15 hover:border-white/25">
                          <InfoIcon className="h-3 w-3 text-white/60 group-hover:text-white/80 transition-colors duration-200" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm p-2.5 bg-gradient-to-br from-zinc-900/95 to-zinc-800/95 backdrop-blur-sm border border-white/10 shadow-lg">
                        <p className="text-xs text-white/85 leading-relaxed">
                          {modelItem.description}
                        </p>
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