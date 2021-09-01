// useTransition for improved loading states
// http://localhost:3000/isolated/exercise/03.js

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

// 🐨 create a SUSPENSE_CONFIG variable right here and configure timeoutMs to
// whatever feels right to you, then try it out and tweak it until you're happy
// with the experience.
// this timeout sets how long to wait before setting isPending to false
// i.e. how long to wait until we fall back to the Suspense fallback component
// For example if the timeout is 1000 and the delay for the response coming back is 9000
// we will have isPending set to true for 1000ms which will set the opacity to 0.6
// once that 1000ms is over then the transition will finish, is pending will be set to false 
// and we will fall back to the suspense fallback component
// timeout = how long does it take to transition to the fallback component
// const SUSPENSE_CONFIG = {
//   timeoutMs: 1000
// }

/*
- `busyDelayMs`: Set this to the time of our CSS transition. This is the part
  that says "if the transition takes X amount of time"
- `busyMinDurationMs`: Set this to the total time you want the transition state
  to persist if we surpass the `busyDelayMs` time.

  what busyDelayMs says is if we are busy waiting for 300 ms (busyDelayMs), then 
  I want to be pending for at least 1000ms (busyMinDurationMs)

  this is for people with middle speed connection
*/
const SUSPENSE_CONFIG = {
  timeoutMs: 1500,
  busyDelayMs: 300,
  busyMinDurationMs: 1000
}


function createPokemonResource(pokemonName) {
  // 🦉 once you've finished the exercise, play around with the delay...
  // the second parameter to fetchPokemon is a delay so you can play around
  // with different timings
  // let delay = 9000
  let delay = 200
  // try a few of these fetch times:
  // shows busy indicator
  // delay = 450

  // shows busy indicator, then suspense fallback
  // delay = 5000

  // shows busy indicator for a split second
  // 💯 this is what the extra credit improves
  // delay = 200
  return createResource(fetchPokemon(pokemonName, delay))
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  // 🐨 add a useTransition hook here
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG)
  const [pokemonResource, setPokemonResource] = React.useState(null)

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    // 🐨 wrap this next line in a startTransition call
    // start transition set
    startTransition(() => {
      setPokemonResource(createPokemonResource(pokemonName))
    })
    // 🐨 add startTransition to the deps list here
  }, [pokemonName, startTransition])

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  // const pokemonInfoStyle = isPending ? {opacity:'0.6'} : {}

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      {/*
        🐨 add inline styles here to set the opacity to 0.6 if the
        useTransition above is pending
      */}
      {/* <div style={pokemonInfoStyle} className="pokemon-info"> */}
      {/* 
        Added a transition delay in pokemon-loading so we don't show the loading state straight away but wait 
        a little bit before we show the loading state, so we do not get a flash of loading state
        This is mainly for people with very fast connections
      */}
      <div className={isPending ? 'pokemon-loading pokemon-info' : 'pokemon-info'}>
      {/* 
        Because the Suspense boundary is inside of the ternary we get the loading instead of the
        opacity on the first render
        The React Suspense boundary will immediately show the fallback regardless of any useTransition 
        when its initially mounted
        If we move the Suspense boundary outside, it would of already rendered as it isn't determined to being rendered
        by the pokemonResource. pokemonResource is null on the first initial render so React.Suspense doesn't render
        and it only renders the first time when pokemonResource, hence setting it to the loading screen
      */}
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
