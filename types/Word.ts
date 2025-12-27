export type Language = "en" | "de" | "ru";

export type Word = {
  id: string;
  text: string;               // idegen nyelvi alak
  translation?: string;        // magyar jelentés (opcionális)
  language: Language;
  createdAt: number;
  gender?: "m" | "f" | "n";  // német vagy orosz nem
  suspended?: boolean; 
};

