import React, { useContext, useEffect, useState } from "react"
import PokeAPI, { INamedApiResource, INamedApiResourceList, IPokemon, IType } from "pokeapi-typescript"
import { getIdFromUrl } from "../../utils"

export enum Field {
  favourite = "favourite",
  types = "types"
}

type Filters = { [key in Field]: FilterValue }
type FilterValue = boolean | string | string[] | undefined

interface PokemonContextData {
  pokemon: INamedApiResource<IPokemon>[]
  allTypes: PokemonTypeData[]
  query: string
  search: (query: string) => void
  favourites: string[]
  addFavourite: (pokemon: INamedApiResource<IPokemon>) => void
  removeFavourite: (pokemon: INamedApiResource<IPokemon>) => void
  selectedTypes: PokemonType[]
  addFilterType: (type: PokemonType) => void
  removeFilterType: (type: PokemonType) => void
  filters: Filters
  addFilter: (field: Field, value: FilterValue) => void
  removeFilter: (field: Field) => void
}

export const PokemonContext = React.createContext<PokemonContextData | undefined>(undefined)

interface PokemonProviderProps {
  children: React.ReactNode
}

export interface PokemonTypeData {
  name: string
  pokemon: string[]
}

export enum PokemonType {
  bug = "bug",
  dark = "dark",
  dragon = "dragon",
  electric = "electric",
  fairy = "fairy",
  fighting = "fighting",
  fire = "fire",
  flying = "flying",
  ghost = "ghost",
  grass = "grass",
  ground = "ground",
  ice = "ice",
  normal = "normal",
  poison = "poison",
  psychic = "psychic",
  rock = "rock",
  steel = "steel",
  water = "water",
}

export enum PokemonStat {
  hp = "hp",
  attack = "attack",
  defense = "defense",
  specialAttack = "special-attack",
  specialDefense = "special-defense",
  speed = "speed"
}

const PokemonProvider: React.FC<PokemonProviderProps> = ({ children }) => {
  const [data, setData] = useState<INamedApiResource<IPokemon>[]>()
  const [pokemon, setPokemon] = useState<INamedApiResource<IPokemon>[]>()
  const [allTypes, setAllTypes] = useState<PokemonTypeData[]>([])
  const [selectedTypes, setSelectedTypes] = useState<PokemonType[]>([])
  const [favourites, setFavourites] = useState<string[]>([])
  const [query, setQuery] = useState<string>("")
  const [filters, setFilters] = useState<Filters>({} as Filters)
  const [error, setError] = useState<any>()

  useEffect(() => {
    fetchPokemon()
  }, [])

  useEffect(() => {
    fetchAllTypes()
  }, [])

  useEffect(() => {
    addFilter(Field.types, [...selectedTypes])
  }, [selectedTypes])

  useEffect(() => {
    filterData()
  }, [filters, query, data])

  const filterData = async () => {
    if (!data) {
      return
    }

    let filteredData = [...data]
    const fields = Object.keys(filters) as Field[]

    for (const field of fields) {
      switch (field) {
        case Field.favourite: {
          const value = filters[field]
          if (value) {
            filteredData = filteredData.filter((pokemon) => favourites.includes(pokemon.name))
          } else if (value === false) {
            filteredData = filteredData.filter((pokemon) => !favourites.includes(pokemon.name))
          }
          break
        }
        case Field.types: {
          const selectedTypes = filters[field] as string[]
          const filteredTypes = allTypes
            .filter(type => selectedTypes.includes(type.name))
            .map(type => type.pokemon).flat(1)

          if (filteredTypes.length > 0) {
            filteredData = filteredData.filter((pokemon) => filteredTypes.includes(pokemon.name))
          }
          break
        }
      }
    }

    if (query) {
      filteredData = filteredData.filter((pokemon) => pokemon.name.includes(query))
    }

    filteredData.sort((a, b) => {
      const aId = getIdFromUrl(a.url)
      const bId = getIdFromUrl(b.url)

      if (aId > bId) {
        return 1
      } else {
        return -1
      }
    })

    setPokemon(filteredData)
  }

  const fetchPokemon = async () => {
    try {
      const response = await PokeAPI.Pokemon.list(150, 0)
      setData(response.results)
      setPokemon(response.results)
    } catch (error) {
      setError(error)
    }
  }

  const fetchAllTypes = async () => {
    try {
      const response: INamedApiResourceList<IType> = await PokeAPI.Type.listAll()

      await Promise.all(
        response.results.map(({ name }) =>
          PokeAPI.Type.resolve(name)
            .then(type => ({
              name: type.name,
              pokemon: type.pokemon.map(pokemon => pokemon.pokemon.name),
            })
            )
        )
      )
        .then((allTypes: PokemonTypeData[]) => setAllTypes(allTypes))
    } catch (error) {
      setError(error)
    }
  }

  const search = (query: string) => {
    setQuery(query)
  }

  function addFavourite(pokemon: INamedApiResource<IPokemon>) {
    setFavourites([...favourites, pokemon.name])
  }

  function removeFavourite(pokemon: INamedApiResource<IPokemon>) {
    setFavourites(favourites.filter((favourite) => favourite !== pokemon.name))
  }

  function addFilterType(type: PokemonType) {
    setSelectedTypes([...selectedTypes, type])
  }

  function removeFilterType(type: PokemonType) {
    setSelectedTypes(selectedTypes.filter((selectedType) => selectedType !== type))
  }

  function addFilter(field: Field, value: FilterValue) {
    const newFilters = {...filters, [field]: value}
    setFilters(newFilters)
  }

  function removeFilter(field: Field) {
    const newFilters = {...filters}
    newFilters[field] = undefined
    setFilters(newFilters)
  }

  if (error) {
    return <div>Error</div>
  }

  if (!pokemon) {
    return <div></div>
  }

  return (
    <PokemonContext.Provider value={{
      pokemon,
      allTypes,
      query,
      search,
      favourites,
      addFavourite,
      removeFavourite,
      selectedTypes,
      addFilterType,
      removeFilterType,
      filters,
      addFilter,
      removeFilter
    }}>
      {children}
    </PokemonContext.Provider>
  )
}

export const usePokemonContext = () => {
  const pokemon = useContext(PokemonContext)

  if (!pokemon) {
    throw Error("Cannot use `usePokemonContext` outside of `PokemonProvider`")
  }

  return pokemon
}

export default PokemonProvider