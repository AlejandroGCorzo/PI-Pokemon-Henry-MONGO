const { Router } = require('express');
const {
  createPokemon,
  getAllPokemon,
  getPokById,
  getPokByName,
  getTypes,
  destroyPokemon,
  modifyPokemon,
} = require('./functions.js');

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

router.get('/types', async (require, resolve) => {
  resolve.json(await getTypes());
});

router.get('/pokemons/:id', async (require, resolve) => {
  const { id } = require.params;
  try {
    resolve.json(await getPokById(id));
  } catch (error) {
    resolve.send('Pokemon not found by Id');
  }
});

router.delete('/pokemons/:id', async (require, resolve) => {
  const { id } = require.params;
  try {
    resolve.send(await destroyPokemon(id));
  } catch (error) {
    resolve.status(400).send('Pokemon not in DB!');
  }
});

router.put('/pokemons/:id', async (require, resolve) => {
  const { id } = require.params;
  const newPok = { ...require.body };
  console.log({ id, ...newPok });
  try {
    resolve.send(await modifyPokemon({ id, ...newPok }));
  } catch (error) {
    resolve.status(400).send(error);
  }
});

router.get('/pokemons', async (require, resolve) => {
  const { name } = require.query;
  if (name) {
    try {
      return resolve.json(await getPokByName(name));
    } catch (error) {
      return resolve.send('Pokemon not found by Name');
    }
  }
  resolve.json(await getAllPokemon());
});

router.post('/pokemons', async (require, resolve) => {
  const {
    name,
    hp,
    attack,
    special_attack,
    defense,
    special_defense,
    speed,
    height,
    weight,
    img,
    type,
    moves,
  } = require.body;
  try {
    resolve.json(
      await createPokemon(
        name,
        hp,
        attack,
        special_attack,
        defense,
        special_defense,
        speed,
        height,
        weight,
        img,
        type,
        moves
      )
    );
  } catch (error) {
    console.log(error);
    resolve.status(400).json(error);
  }
});

module.exports = router;
