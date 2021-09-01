// Simple Data-fetching
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'
// 🐨 you'll also need to get the fetchPokemon function from ../pokemon:
import {createResource} from '../utils'
import {PokemonDataView, fetchPokemon, PokemonErrorBoundary, PokemonInfoFallback} from '../pokemon'

// 💰 use it like this: fetchPokemon(pokemonName).then(handleSuccess, handleFailure)
// const pokemonPromise = fetchPokemon(pokemonName).then(handleSuccess, handleFailure)

// 🐨 create a variable called "pokemon" (using let)
// let pokemon
// let pokemonError

// 💣 delete this now...
// const pokemon = {
//   name: 'TODO',
//   number: 'TODO',
//   attacks: {
//     special: [{name: 'TODO', type: 'TODO', damage: 'TODO'}],
//   },
//   fetchedAt: 'TODO',
// }

// We don't need the app to be mounted to know that we want to fetch the pokemon
// named "pikachu" so we can go ahead and do that right here.
// 🐨 assign a pokemonPromise variable to a call to fetchPokemon('pikachu')
// const pokemonPromise = fetchPokemon('pikachu')

// function createResource(promise) {
//   let status = 'pending'
//   let result = promise.then(resolved => {
//     status = 'resolved'
//     result = resolved
//   }, rejected => {
//     status = 'rejected'
//     result = rejected
//   })

//   return {
//     read() {
//       if (status === 'pending') throw result
//       else if (status === 'rejected') throw result
//       else return result
//     }
//   }
// }

// const resource = createResource(fetchPokemon('pikachu'))
const resource = createResource(fetchPokemon('pikachu'))


// 🐨 when the promise resolves, assign the "pokemon" variable to the resolved value
// 💰 For example: somePromise.then(resolvedValue => (someValue = resolvedValue))
// pokemonPromise.then(pokemonData => pokemon = pokemonData, (e) => {pokemonError = e})

function PokemonInfo() {
  const pokemon = resource.read()

  // 🐨 if there's no pokemon yet, then throw the pokemonPromise
  // 💰 (no, for real. Like: `throw pokemonPromise`)

  // if(pokemonError) {
  //   throw pokemonError
  // }
  // if(!pokemon) {
  //   // we have to give react the pokemon promise, so it knows when it is good to rerender
  //   // the component
  //   // react then attaches its own try catch handler which says when this is resolved
  //   // then lets trigger a rerender
  //   throw resource.read()
  // }

  // if the code gets it this far, then the pokemon variable is defined and
  // rendering can continue!

  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}



function App() {
  return (
    <div className="pokemon-info-app">
      <div className="pokemon-info">
        {/* 🐨 Wrap the PokemonInfo component with a React.Suspense component with a fallback */}
          <PokemonErrorBoundary>
          <React.Suspense fallback={<PokemonInfoFallback />}>
              <PokemonInfo />
          </React.Suspense>
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

export default App
