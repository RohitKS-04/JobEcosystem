export type TestChecklistItem = {
  id: string;
  label: string;
  hint: string;
  checked: boolean;
};

export type TestChecklistState = {
  items: TestChecklistItem[];
  updatedAt: string;
};
