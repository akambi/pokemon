import { Box, Stack, Button } from "@mui/material"
import { PokemonType, PokemonTypeData } from "./Contexts/PokemonProvider"
import React from "react"
import PokemonTypeIcon from "./PokemonTypeIcon"

interface PokemonFilterTypesProps {
  allTypes: PokemonTypeData[]
  selectedTypes: PokemonType[]
  addFilterType: (type: PokemonType) => void
  removeFilterType: (type: PokemonType) => void
}

const PokemonFilterTypes: React.FC<PokemonFilterTypesProps> = ({
  allTypes,
  selectedTypes,
  addFilterType,
  removeFilterType
}) => {

  function handleToggleType(type: PokemonType) {
    if (selectedTypes.includes(type)) {
      removeFilterType(type)
    } else {
      addFilterType(type)
    }
  }

  const types: PokemonType[] = allTypes.map(type => type.name) as PokemonType[]

  return (
    <Box
      sx={{
        display: "flex",
        pt: 4,
        pb: 2
      }}
    >
      <Stack
        spacing={1}
      >
        {types.map((type) => (
          <Button
            key={type}
            startIcon={<PokemonTypeIcon type={type} />}
            color={selectedTypes.includes(type) ? "primary": "secondary"}
            onClick={() => handleToggleType(type)}
          >
            {type}
          </Button>
        ))}
      </Stack>
    </Box>
  )
}

export default PokemonFilterTypes