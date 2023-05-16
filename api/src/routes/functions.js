const axios = require('axios');
const db = require('../db.js');
const { Pokemon, Type } = require('../db.js');

const getTypes = async () => {
  let dbTypes = await Type.findAll({
    attributes: ['name'],
  });
  dbTypes = dbTypes.map((el) => el.dataValues).map((el) => el.name);
  let apiTypes = await axios
    .get('https://pokeapi.co/api/v2/type')
    .then((el) => el.data.results.map((el) => el.name));
  return [...new Set([...dbTypes, ...apiTypes])];
};

const createPokemon = async (
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
) => {
  let pokeType = type.map((el) => el.toLowerCase());

  pokeType = await pokeType.map(async (el) => {
    const [typp, created] = await Type.findOrCreate({
      where: { name: el },
    });
    return typp;
  });

  pokeType = await Promise.all(pokeType);

  // console.log(pokeType);
  // const [pokeType, created] = await Type.findOrCreate({
  //   where: { name: type },
  // });
  name = name.toLowerCase();
  if (img === '' || !img)
    img =
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Pokebola-pokeball-png-0.png/800px-Pokebola-pokeball-png-0.png';
  moves = moves.join();
  const newPoke = await Pokemon.create({
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
    moves,
  });

  newPoke.addTypes(pokeType);
  // newPoke.addType(pokeType);
  return 'Pokemon created!';
};

const getPokByName = async (name) => {
  name = name.toLowerCase();
  let apiPok = await Pokemon.findAll({
    where: { name },
    include: {
      model: Type,
      attributes: ['name'],
      through: {
        attributes: [],
      },
    },
  });
  apiPok = apiPok
    .map((el) => el.dataValues)
    .map((el) => {
      return {
        ...el,
        types: el.types.map((el) => el.name),
        moves: el.moves.split(','),
      };
    });
  if (apiPok.length === 0)
    apiPok = await axios
      .get(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((el) => {
        return {
          id: el.data.id,
          name: el.data.name,
          hp: el.data.stats.find((el) => el.stat.name === 'hp').base_stat,
          attack: el.data.stats.find((el) => el.stat.name === 'attack')
            .base_stat,
          defense: el.data.stats.find((el) => el.stat.name === 'defense')
            .base_stat,
          special_defense: el.data.stats.find(
            (el) => el.stat.name === 'special-defense'
          ).base_stat,
          speed: el.data.stats.find((el) => el.stat.name === 'speed').base_stat,
          height: el.data.height,
          weight: el.data.weight,
          img: el.data.sprites.other['official-artwork'].front_default,
          types: el.data.types.map((el) => el.type.name),
          moves: el.data.moves.map((el) => el.move.name).slice(0, 3),
        };
      });

  return [apiPok];
};

const getPokById = async (id) => {
  let apiPok;
  if (Number(id))
    apiPok = await axios
      .get(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then((el) => {
        return {
          id: el.data.id,
          name: el.data.name,
          hp: el.data.stats.find((el) => el.stat.name === 'hp').base_stat,
          attack: el.data.stats.find((el) => el.stat.name === 'attack')
            .base_stat,
          special_attack: el.data.stats.find(
            (el) => el.stat.name === 'special-attack'
          ).base_stat,
          defense: el.data.stats.find((el) => el.stat.name === 'defense')
            .base_stat,
          special_defense: el.data.stats.find(
            (el) => el.stat.name === 'special-defense'
          ).base_stat,
          speed: el.data.stats.find((el) => el.stat.name === 'speed').base_stat,
          height: el.data.height,
          weight: el.data.weight,
          img: el.data.sprites.other['official-artwork'].front_default,
          types: el.data.types.map((el) => el.type.name),
          moves: el.data.moves.map((el) => el.move.name).slice(0, 3),
        };
      });
  else {
    apiPok = await Pokemon.findAll({
      where: { id },
      include: {
        model: Type,
        attributes: ['name'],
        through: {
          attributes: [],
        },
      },
    });
    // console.log(apiPok);
    apiPok = apiPok
      .map((el) => el.dataValues)
      .map((el) => {
        return {
          ...el,
          types: el.types.map((el) => el.name),
          moves: el.moves.split(','),
        };
      })[0];
  }
  return apiPok;
};

const getAllPokemon = async () => {
  let allPokes = [];
  let dbPok = await Pokemon.findAll({
    include: {
      model: Type,
      attributes: ['name'],
      through: {
        attributes: [],
      },
    },
  });
  dbPok = dbPok
    .map((el) => el.dataValues)
    .map((el) => {
      return {
        ...el,
        types: el.types.map((el) => el.name),
        moves: el.moves.split(','),
      };
    });
  let apiPok = await axios
    .get(`https://pokeapi.co/api/v2/pokemon?offset=0&limit=151`)
    .then((el) => el.data.results);
  apiPok = apiPok.map(async (el) => await axios.get(el.url));
  apiPok = await Promise.all(apiPok).then((el) => {
    el.map((el) => {
      // console.log(el.data)
      allPokes.push({
        id: el.data.id,
        name: el.data.name,
        hp: el.data.stats.find((el) => el.stat.name === 'hp').base_stat,
        attack: el.data.stats.find((el) => el.stat.name === 'attack').base_stat,
        special_attack: el.data.stats.find(
          (el) => el.stat.name === 'special-attack'
        ).base_stat,
        defense: el.data.stats.find((el) => el.stat.name === 'defense')
          .base_stat,
        special_defense: el.data.stats.find(
          (el) => el.stat.name === 'special-defense'
        ).base_stat,
        speed: el.data.stats.find((el) => el.stat.name === 'speed').base_stat,
        height: el.data.height,
        weight: el.data.weight,
        img: el.data.sprites.other['official-artwork'].front_default,
        types: el.data.types.map((el) => el.type.name),
        moves: el.data.moves.map((el) => el.move.name).slice(0, 3),
      });
    });
    return allPokes;
  });
  // console.log(apiPok);

  return [...apiPok, ...dbPok];
};

const destroyPokemon = async (id) => {
  await Pokemon.destroy({
    where: { id },
  });
  return `Pokemon deleted!`;
};

const modifyPokemon = async (newPok) => {
  const oldPok = await Pokemon.findOne({
    where: { id: newPok.id },
    include: { model: Type, attributes: ['name'], through: { attributes: [] } },
  });
  console.log(newPok.types);
  if (newPok.types && newPok.types.length) {
    let pokeType = newPok.types.map((el) => el.toLowerCase());
    pokeType = await pokeType.map(async (el) => {
      const [typp, created] = await Type.findOrCreate({
        where: { name: el },
      });
      return typp;
    });

    pokeType = await Promise.all(pokeType);
  }
  // console.log(pokeType);
  try {
    await oldPok.update(newPok);
    await oldPok.setTypes(pokeType);
    return 'JOIA';
  } catch (error) {
    return error;
  }
};

module.exports = {
  createPokemon,
  getAllPokemon,
  getPokById,
  getPokByName,
  getTypes,
  destroyPokemon,
  modifyPokemon,
};
