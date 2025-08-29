import {
    SiReact,
    SiTypescript,
    SiJavascript,
    SiCss,
    SiHtml5,
    SiJson,
    SiMarkdown,
} from '@icons-pack/react-simple-icons';
import { FileCode2 } from 'lucide-react';

export const iconMap = {
    // TypeScript and JavaScript files
    ts: { component: SiTypescript, color: '#3178C6' },
    tsx: { component: SiReact, color: '#149ECA' },
    js: { component: SiJavascript, color: '#F7DF1E' },
    jsx: { component: SiReact, color: '#149ECA' },
    
    // Web files
    css: { component: SiCss, color: '#1572B6' },
    html: { component: SiHtml5, color: '#E34F26' },
    
    // Data files
    json: { component: SiJson, color: '#F5F5F5' },
    md: { component: SiMarkdown, color: '#FFFFFF' },
    markdown: { component: SiMarkdown, color: '#FFFFFF' },
    
    // Legacy support (keeping for backward compatibility)
    react: { component: SiReact, color: '#149ECA' },
    typescript: { component: SiTypescript, color: '#3178C6' },
    javascript: { component: SiJavascript, color: '#F7DF1E' },
};


 // Function to get file icon based on extension
export const getFileIcon = (filePath: string) => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    const iconEntry = iconMap[extension as keyof typeof iconMap];
    
    if (iconEntry) {
      const IconComponent = iconEntry.component;
      return <IconComponent color={iconEntry.color} size={18} />;
    }
    return <FileCode2 className="w-[18px] h-[18px] text-zinc-400" />;
  };
