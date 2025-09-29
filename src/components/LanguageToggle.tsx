import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

interface LanguageToggleProps {
  onLanguageChange: (language: 'bn' | 'en') => void;
  currentLanguage: 'bn' | 'en';
}

export const LanguageToggle = ({ onLanguageChange, currentLanguage }: LanguageToggleProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onLanguageChange(currentLanguage === 'bn' ? 'en' : 'bn')}
      className="flex items-center gap-2"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">
        {currentLanguage === 'bn' ? 'English' : 'বাংলা'}
      </span>
    </Button>
  );
};