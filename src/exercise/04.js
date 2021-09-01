// Cache resources
// http://localhost:3000/isolated/exercise/04.js

import chalk from 'chalk'
import * as React from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary,
} from '../pokemon'
import {createResource} from '../utils'

function PokemonInfo({pokemonResource}) {
  const pokemon = pokemonResource.read()
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
}

// 🐨 create a pokemonResourceCache object
// const pokemonResourceCache = {}

// 🐨 create a getPokemonResource function which accepts a name checks the cache
// for an existing resource. If there is none, then it creates a resource
// and inserts it into the cache. Finally the function should return the
// resource.

// function getPokemonResource(name) {
//   const lowerCaseName = name.toLowerCase() 
//   if (!pokemonResourceCache[lowerCaseName]) {
//     pokemonResourceCache[lowerCaseName] = createPokemonResource(lowerCaseName)
//   }

//   return pokemonResourceCache[lowerCaseName]
// }

function createPokemonResource(pokemonName) {
  return createResource(fetchPokemon(pokemonName))
}

function usePokemonResourceCache() {
  return React.useContext(PokemonCacheContext)
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG)
  const [pokemonResource, setPokemonResource] = React.useState(null)

  const getPokemonResource = usePokemonResourceCache()

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    startTransition(() => {
      // 🐨 change this to getPokemonResource instead
      setPokemonResource(getPokemonResource(pokemonName))
    })
  }, [pokemonName, startTransition, getPokemonResource])

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className={`pokemon-info ${isPending ? 'pokemon-loading' : ''}`}>
          {pokemonResource ? (
            <PokemonErrorBoundary
              onReset={handleReset}
              resetKeys={[pokemonResource]}
            >
              <React.Suspense
                fallback={<PokemonInfoFallback name={pokemonName} />}
              >
                <PokemonInfo pokemonResource={pokemonResource} />
              </React.Suspense>
            </PokemonErrorBoundary>
          ) : (
            'Submit a pokemon'
          )}
      </div>
    </div>
  )
}

const PokemonCacheContext = React.createContext();


// My attempt at cache time
function PokemonCacheProvider({cacheTime = 5000, children}) {
  const pokemonResourceCache = React.useRef({});

  const getPokemonResource = React.useCallback((name) => {
    const lowerCaseName = name.toLowerCase() 
    if (!pokemonResourceCache.current[lowerCaseName]) {
      pokemonResourceCache.current[lowerCaseName] = {resource: createPokemonResource(lowerCaseName), cacheTime}
    }
  
    return pokemonResourceCache.current[lowerCaseName].resource
  }, [pokemonResourceCache, cacheTime])

  React.useEffect(() => {

  const interval = setInterval(() => {
    const keys = Object.keys(pokemonResourceCache.current)
    for(const key of keys) {
      if(pokemonResourceCache.current[key].cacheTime - 200 < 0) {
        delete pokemonResourceCache.current[key]
      } else {
        pokemonResourceCache.current[key].cacheTime = pokemonResourceCache.current[key].cacheTime - 200
      }
  }
  }, 200);

  return () => clearInterval(interval)
})


  return (
    <PokemonCacheContext.Provider value={getPokemonResource}>
      {children}
    </PokemonCacheContext.Provider>
  )
}

function PokemonCacheProvider2({cacheTime = 5000, children}) {
  const pokemonResourceCache = React.useRef({});
  const expirations = React.useRef({})

  const getPokemonResource = React.useCallback((name) => {
    const lowerCaseName = name.toLowerCase() 
    if (!pokemonResourceCache.current[lowerCaseName]) {
      pokemonResourceCache.current[lowerCaseName] = createPokemonResource(lowerCaseName)
    }
    expirations.current[lowerCaseName] = Date.now() + cacheTime

    return pokemonResourceCache.current[lowerCaseName]
  }, [pokemonResourceCache, cacheTime])

  React.useEffect(() => {
    const interval = setInterval(() => {
      for(const [name, time] of Object.entries(expirations.current)) {
        if(time < Date.now()) {
          delete pokemonResourceCache.current[name]
          delete expirations.current[name]
        }
      }
    }, 1000);

    return () => clearInterval(interval)
  })

  return (
    <PokemonCacheContext.Provider value={getPokemonResource}>
      {children}
    </PokemonCacheContext.Provider>
  )
}


function AppWithProvider() {
  return (
    <PokemonCacheProvider2 cacheTime={5000}>
      <App />
    </PokemonCacheProvider2>
  )
}

export default AppWithProvider
