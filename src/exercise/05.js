// Suspense Image
// http://localhost:3000/isolated/exercise/05.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  // PokemonDataView,
  PokemonErrorBoundary,
  getImageUrlForPokemon
} from '../pokemon'
import {createResource, preloadImage} from '../utils'
const PokemonInfo = React.lazy(() =>
  import('../lazy/pokemon-info-render-as-you-fetch'),)

// ❗❗❗❗
// 🦉 On this one, make sure that you UNCHECK the "Disable cache" checkbox
// in your DevTools "Network Tab". We're relying on that cache for this
// approach to work!
// ❗❗❗❗

// we need to make a place to store the resources outside of render so
// 🐨 create "cache" object here.
// const imgSrcResourceCache = {}

// exercise 1
// 🐨 create an Img component that renders a regular <img /> and accepts a src
// prop and forwards on any remaining props.
// 🐨 The first thing you do in this component is check whether your
// imgSrcResourceCache already has a resource for the given src prop. If it does
// not, then you need to create one (💰 using createResource).
// 🐨 Once you have the resource, then render the <img />.
// 💰 Here's what rendering the <img /> should look like:
// <img src={imgSrcResource.read()} {...props} />
// function getPokemonImgResource(name) {
//   const lowerName = name.toLowerCase()
//   let resource = imgSrcResourceCache[lowerName]
//   if (!resource) {
//     resource = createPokemonImgResource(lowerName)
//     imgSrcResourceCache[lowerName] = resource
//   }
//   return resource
// }

// function createPokemonImgResource(name) {
//   const imageUrl = getImageUrlForPokemon(name)
//   return createResource(preloadImage(imageUrl))
// }

// function preloadImage(src) {
//   return new Promise(resolve => {
//     const img = document.createElement('img')
//     img.src = src
//     img.onload = () => resolve(src)
//   })
// }


// exercise 1
// function Img({src, ...props}) {
//   const imgSrcResource = getPokemonImgResource(src)
//   return <img src={imgSrcResource.read()} {...props} />
// }

// exercise 1
// function PokemonInfo({pokemonResource}) {
//   const pokemon = pokemonResource.read()
//   return (
//     <div>
//       <div className="pokemon-info__img-wrapper">
//         {/* 🐨 swap this img for your new Img component */}
//         {/* <img src={pokemon.image} alt={pokemon.name} /> */}
//         <Img src={pokemon.image} alt={pokemon.name} />
//       </div>
//       <PokemonDataView pokemon={pokemon} />
//     </div>
//   )
// }

// function PokemonInfo({pokemonResource}) {
//   const pokemon = pokemonResource.data.read()
//   return (
//     <div>
//       <div className="pokemon-info__img-wrapper">
//         <img src={pokemonResource.image.read()} alt={pokemon.name} />
//       </div>
//       <PokemonDataView pokemon={pokemon} />
//     </div>
//   )
// }

const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
}

const pokemonResourceCache = {}

function getPokemonResource(name) {
  const lowerName = name.toLowerCase()
  let resource = pokemonResourceCache[lowerName]
  if (!resource) {
    resource = createPokemonResource(lowerName)
    pokemonResourceCache[lowerName] = resource

  }
  return resource
}

function createPokemonResource(pokemonName) {
  return {
    data: createResource(fetchPokemon(pokemonName)),
    // preloadImage resolves with the url of the image
    image: createResource(preloadImage(getImageUrlForPokemon(pokemonName)))
  }
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG)
  const [pokemonResource, setPokemonResource] = React.useState(null)

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    startTransition(() => {
      setPokemonResource(getPokemonResource(pokemonName))
    })
  }, [pokemonName, startTransition])

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

export default App
