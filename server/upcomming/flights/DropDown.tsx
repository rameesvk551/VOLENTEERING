import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { DropdownMenuContent } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useState } from "react";

const MyDropdown = ({
    dropdownItems,
    name,
    onSelect
  }: {
    dropdownItems: string[];
    name: string;
    onSelect?: (item: string) => void;
  }) => {
    const [selectedItem, setSelectedItem] = useState<string>(name);
  
    const handleSelect = (item: string) => {
      setSelectedItem(item);
      onSelect?.(item); // This will notify parent to update filters
    };
  
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{selectedItem}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {dropdownItems.map((item) => (
            <DropdownMenuItem key={item} onClick={() => handleSelect(item)}>
              {item}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };



  export default MyDropdown