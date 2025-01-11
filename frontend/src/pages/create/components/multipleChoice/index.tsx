import React from 'react';

import { capitalize } from '@utils/capitalize';

import {
  Box,
  TextInput,
  Button,
  Checkbox,
  Text,
  ActionList,
} from '@primer/react';
import { SearchIcon, ChevronDownIcon } from '@primer/octicons-react';

interface Props {
  text: string;
  open: boolean;
  setOpen: any;
  items: string[];
  selected: string[];
  setSelected: any;
  label: string;
  maxSelected: number;
}

const scrollBarStyle = `  
  .multipleChoiceScrollBar::-webkit-scrollbar {
    width: 8px; 
  }
  
  .multipleChoiceScrollBar::-webkit-scrollbar-track {
    background: #0d1117;
  }
  
  .multipleChoiceScrollBar::-webkit-scrollbar-thumb {
    background-color: #484f58; 
    border-radius: 10px; 
    border: 3px solid #0d1117; 
  }
  
  .multipleChoiceScrollBar::-webkit-scrollbar-thumb:hover {
    background-color: #484f58; 
  }
  
  .multipleChoiceScrollBar {
    scrollbar-width: thin; 
    scrollbar-color: #484f58 #0d1117; 
  }`;

export const MultipleChoice = (props: Props) => {
  const {
    text,
    open,
    items,
    label,
    setOpen,
    selected,
    setSelected,
    maxSelected,
  } = props;
  const [filter, setFilter] = React.useState(items);

  const onSelect = (selectedItem: string) => {
    let newSelected;
    if (selected.some((item) => item === selectedItem)) {
      newSelected = selected.filter((item) => item !== selectedItem);
    } else if (selected.length == maxSelected) {
      newSelected = [...selected.slice(1), selectedItem];
    } else {
      newSelected = [...selected, selectedItem];
    }
    setSelected(newSelected);
  };

  const onChange = (event: any) => {
    const value = event.target.value;
    if (value == '') {
      setFilter(items);
    }
    setFilter(
      items.filter((item) => item.toLowerCase().startsWith(value.toLowerCase()))
    );
  };

  return (
    <Box
      sx={{
        position: 'relative',
        zIndex: 99,
      }}
    >
      <Button
        onClick={() => {
          setOpen(!open);
          if (!open) {
            setFilter(items);
          }
        }}
      >
        {text} <ChevronDownIcon />
      </Button>
      {open && (
        <Box
          sx={{
            backgroundColor: 'canvas.default',
            border: '1px solid',
            borderColor: 'ansi.black',
            position: 'absolute',
            borderRadius: '10px',
            bottom: -110,
            right: 220,
            transform: 'translate(105%,65%)',
            width: 'max-content',
            p: '12px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mt: 2,
              mr: 3,
              ml: 2,
              mb: 3,
            }}
          >
            <Text sx={{ fontFamily: 'inter tight', fontWeight: '600' }}>
              {label}
            </Text>
            <Text
              onClick={() => {
                setOpen(false);
              }}
              sx={{
                backgroundColor: '#eb2c1e',
                pl: '10px',
                pr: '11px',
                pb: '4px',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              x
            </Text>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              my: 2,
            }}
          >
            <TextInput trailingVisual={SearchIcon} onChange={onChange} />
          </Box>
          <div
            className="multipleChoiceScrollBar"
            style={{
              overflowY: 'auto',
              height: '140px',
            }}
          >
            <style>{scrollBarStyle}</style>
            <ActionList>
              {filter.map((item: string, index: number) => {
                return (
                  <ActionList.Item
                    value={item}
                    onClick={() => {
                      onSelect(item);
                    }}
                    key={index}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Checkbox
                        checked={selected.some((object) => object === item)}
                      />
                      <Text>{capitalize(item)}</Text>
                    </Box>
                  </ActionList.Item>
                );
              })}
            </ActionList>
          </div>
        </Box>
      )}
    </Box>
  );
};
